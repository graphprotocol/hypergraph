import * as Schema from 'effect/Schema';
import { SiweMessage } from 'siwe';
import type { Address, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as Messages from '../messages/index.js';
import { loadKeys, storeAccountId, storeKeys, storeSyncServerSessionToken } from './auth-storage.js';
import { createIdentityKeys } from './create-identity-keys.js';
import { decryptIdentity, encryptIdentity } from './identity-encryption.js';
import { proveIdentityOwnership } from './prove-ownership.js';
import type { Signer, Storage } from './types.js';

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
    console.log('Identity found');
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
