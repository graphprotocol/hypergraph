import * as Schema from 'effect/Schema';
import { SiweMessage } from 'siwe';
import type { Address, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as Messages from '../messages/index.js';
import { store } from '../store.js';
import {
  loadKeys,
  loadSyncServerSessionToken,
  storeAccountId,
  storeKeys,
  storeSyncServerSessionToken,
  wipeSyncServerSessionToken,
} from './auth-storage.js';
import { createIdentityKeys } from './create-identity-keys.js';
import { decryptIdentity, encryptIdentity } from './identity-encryption.js';
import { proveIdentityOwnership } from './prove-ownership.js';
import type { IdentityKeys, Signer, Storage } from './types.js';

export function prepareSiweMessage(
  address: Address,
  nonce: string,
  location: { host: string; origin: string },
  chainId: number,
) {
  return new SiweMessage({
    domain: location.host,
    address,
    statement: 'Sign in to Hypergraph',
    uri: location.origin,
    version: '1',
    chainId,
    nonce,
    expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  }).prepareMessage();
}

export async function identityExists(accountId: string, syncServerUri: string) {
  const res = await fetch(new URL(`/identity?accountId=${accountId}`, syncServerUri), {
    method: 'GET',
  });
  return res.status === 200;
}

export async function getSessionNonce(accountId: string, syncServerUri: string) {
  const nonceReq = { accountId } as const satisfies Messages.RequestLoginNonce;
  const res = await fetch(new URL('/login/nonce', syncServerUri), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nonceReq),
  });
  const decoded = Schema.decodeUnknownSync(Messages.ResponseLoginNonce)(await res.json());
  return decoded.sessionNonce;
}

export async function restoreKeys(
  signer: Signer,
  accountId: Address,
  sessionToken: string,
  syncServerUri: string,
  storage: Storage,
) {
  const keys = loadKeys(storage, accountId);
  if (keys) {
    return keys;
  }
  // Try to get the users identity from the sync server
  const res = await fetch(new URL('/identity/encrypted', syncServerUri), {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  if (res.status === 200) {
    const decoded = Schema.decodeUnknownSync(Messages.ResponseIdentityEncrypted)(await res.json());
    const { keyBox } = decoded;
    const { ciphertext, nonce } = keyBox;
    const keys = await decryptIdentity(signer, accountId, ciphertext, nonce);
    storeKeys(storage, accountId, keys);
    return keys;
  }
  throw new Error(`Error fetching identity ${res.status}`);
}

export async function signup(
  signer: Signer,
  accountId: Address,
  syncServerUri: string,
  chainId: number,
  storage: Storage,
  location: { host: string; origin: string },
) {
  const keys = createIdentityKeys();
  const { ciphertext, nonce } = await encryptIdentity(signer, accountId, keys);
  const { accountProof, keyProof } = await proveIdentityOwnership(signer, accountId, keys);

  const account = privateKeyToAccount(keys.signaturePrivateKey as Hex);
  const sessionNonce = await getSessionNonce(accountId, syncServerUri);
  const message = prepareSiweMessage(account.address, sessionNonce, location, chainId);
  const signature = await account.signMessage({ message });
  const req = {
    keyBox: { accountId, ciphertext, nonce },
    accountProof,
    keyProof,
    message,
    signaturePublicKey: keys.signaturePublicKey,
    encryptionPublicKey: keys.encryptionPublicKey,
    signature,
  } as const satisfies Messages.RequestCreateIdentity;
  const res = await fetch(new URL('/identity', syncServerUri), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (res.status !== 200) {
    // TODO: handle this better?
    throw new Error(`Error creating identity: ${res.status}`);
  }
  const decoded = Schema.decodeUnknownSync(Messages.ResponseCreateIdentity)(await res.json());
  storeAccountId(storage, accountId);
  storeSyncServerSessionToken(storage, accountId, decoded.sessionToken);
  storeKeys(storage, accountId, keys);

  return {
    accountId,
    sessionToken: decoded.sessionToken,
    keys,
  };
}

export async function loginWithWallet(
  signer: Signer,
  accountId: Address,
  syncServerUri: string,
  chainId: number,
  storage: Storage,
  location: { host: string; origin: string },
  retryCount = 0,
) {
  const sessionToken = loadSyncServerSessionToken(storage, accountId);
  if (!sessionToken) {
    const sessionNonce = await getSessionNonce(accountId, syncServerUri);
    // Use SIWE to login with the server and get a token
    const message = prepareSiweMessage(accountId, sessionNonce, location, chainId);
    const signature = await signer.signMessage(message);
    const loginReq = { accountId, message, signature } as const satisfies Messages.RequestLogin;
    const res = await fetch(new URL('/login', syncServerUri), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginReq),
    });
    const decoded = Schema.decodeUnknownSync(Messages.ResponseLogin)(await res.json());
    storeAccountId(storage, accountId);
    storeSyncServerSessionToken(storage, accountId, decoded.sessionToken);
    const keys = await restoreKeys(signer, accountId, decoded.sessionToken, syncServerUri, storage);
    return {
      accountId,
      sessionToken: decoded.sessionToken,
      keys,
    };
  }
  // use whoami to check if the session token is still valid
  const res = await fetch(new URL('/whoami', syncServerUri), {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  if (res.status !== 200 || (await res.text()) !== accountId) {
    console.warn('Session token is invalid, wiping state and retrying login with wallet');
    wipeSyncServerSessionToken(storage, accountId);
    if (retryCount > 3) {
      throw new Error('Could not login with wallet after several attempts');
    }
    return await loginWithWallet(signer, accountId, syncServerUri, chainId, storage, location, retryCount + 1);
  }
  const keys = await restoreKeys(signer, accountId, sessionToken, syncServerUri, storage);
  return {
    accountId,
    sessionToken,
    keys,
  };
}

export async function loginWithKeys(
  keys: IdentityKeys,
  accountId: Address,
  syncServerUri: string,
  chainId: number,
  storage: Storage,
  location: { host: string; origin: string },
  retryCount = 0,
) {
  const sessionToken = loadSyncServerSessionToken(storage, accountId);
  if (sessionToken) {
    // use whoami to check if the session token is still valid
    const res = await fetch(new URL('/whoami', syncServerUri), {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    if (res.status !== 200 || (await res.text()) !== accountId) {
      console.warn('Session token is invalid, wiping state and retrying login with keys');
      wipeSyncServerSessionToken(storage, accountId);
      if (retryCount > 3) {
        throw new Error('Could not login with keys after several attempts');
      }
      return await loginWithKeys(keys, accountId, syncServerUri, chainId, storage, location, retryCount + 1);
    }
    return {
      accountId,
      sessionToken,
      keys,
    };
  }

  const account = privateKeyToAccount(keys.signaturePrivateKey as Hex);
  const sessionNonce = await getSessionNonce(accountId, syncServerUri);
  const message = prepareSiweMessage(account.address, sessionNonce, location, chainId);
  const signature = await account.signMessage({ message });
  const req = {
    accountId,
    message,
    publicKey: keys.signaturePublicKey,
    signature,
  } as const satisfies Messages.RequestLoginWithSigningKey;
  const res = await fetch(new URL('/login/with-signing-key', syncServerUri), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (res.status !== 200) {
    throw new Error('Error logging in with signing key');
  }
  const decoded = Schema.decodeUnknownSync(Messages.ResponseLogin)(await res.json());
  storeAccountId(storage, accountId);
  storeSyncServerSessionToken(storage, accountId, decoded.sessionToken);
  return {
    accountId,
    sessionToken: decoded.sessionToken,
    keys,
  };
}

export async function login(
  signer: Signer,
  accountId: Address,
  syncServerUri: string,
  chainId: number,
  storage: Storage,
  location: { host: string; origin: string },
) {
  const keys = loadKeys(storage, accountId);
  let authData: {
    accountId: Address;
    sessionToken: string;
    keys: IdentityKeys;
  };
  if (!keys && !(await identityExists(accountId, syncServerUri))) {
    authData = await signup(signer, accountId, syncServerUri, chainId, storage, location);
  } else if (keys) {
    authData = await loginWithKeys(keys, accountId, syncServerUri, chainId, storage, location);
  } else {
    authData = await loginWithWallet(signer, accountId, syncServerUri, chainId, storage, location);
  }
  console.log('Identity initialized');
  store.send({
    ...authData,
    type: 'setAuth',
  });
  store.send({ type: 'reset' });
}
