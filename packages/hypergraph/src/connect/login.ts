import * as Schema from 'effect/Schema';
import type { Address } from 'viem';
import * as Messages from '../messages/index.js';
import { store } from '../store-connect.js';
import { storeAccountAddress, storeKeys } from './auth-storage.js';
import { createIdentityKeys } from './create-identity-keys.js';
import { decryptIdentity, encryptIdentity } from './identity-encryption.js';
import { proveIdentityOwnership } from './prove-ownership.js';
import type { IdentityKeys, Signer, Storage } from './types.js';

export async function identityExists(accountAddress: string, syncServerUri: string) {
  const res = await fetch(new URL(`/identity?accountAddress=${accountAddress}`, syncServerUri), {
    method: 'GET',
  });
  return res.status === 200;
}

export async function signup(
  signer: Signer,
  accountAddress: Address,
  syncServerUri: string,
  storage: Storage,
  identityToken: string,
) {
  const keys = createIdentityKeys();
  const { ciphertext, nonce } = await encryptIdentity(signer, accountAddress, keys);
  const { accountProof, keyProof } = await proveIdentityOwnership(signer, accountAddress, keys);

  const req: Messages.RequestConnectCreateIdentity = {
    keyBox: { accountAddress, ciphertext, nonce },
    accountProof,
    keyProof,
    signaturePublicKey: keys.signaturePublicKey,
    encryptionPublicKey: keys.encryptionPublicKey,
  };
  const res = await fetch(new URL('/connect/identity', syncServerUri), {
    method: 'POST',
    headers: {
      'privy-id-token': identityToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (res.status !== 200) {
    // TODO: handle this better?
    throw new Error(`Error creating identity: ${res.status}`);
  }
  const decoded = Schema.decodeUnknownSync(Messages.ResponseConnectCreateIdentity)(await res.json());
  if (!decoded.success) {
    throw new Error('Error creating identity');
  }
  storeAccountAddress(storage, accountAddress);
  storeKeys(storage, accountAddress, keys);

  return {
    accountAddress,
    keys,
  };
}

export async function restoreKeys(
  signer: Signer,
  accountAddress: Address,
  syncServerUri: string,
  storage: Storage,
  identityToken: string,
) {
  const res = await fetch(new URL('/connect/identity/encrypted', syncServerUri), {
    method: 'POST',
    headers: {
      'privy-id-token': identityToken,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 200) {
    const decoded = Schema.decodeUnknownSync(Messages.ResponseIdentityEncrypted)(await res.json());
    const { keyBox } = decoded;
    const { ciphertext, nonce } = keyBox;
    const keys = await decryptIdentity(signer, accountAddress, ciphertext, nonce);
    storeKeys(storage, accountAddress, keys);
    return {
      accountAddress,
      keys,
    };
  }
  throw new Error(`Error fetching identity ${res.status}`);
}

export async function login(
  signer: Signer,
  accountAddress: Address,
  syncServerUri: string,
  storage: Storage,
  identityToken: string,
) {
  // const keys = loadKeys(storage, accountAddress);
  let authData: {
    accountAddress: Address;
    keys: IdentityKeys;
  };
  const exists = await identityExists(accountAddress, syncServerUri);
  if (!exists) {
    authData = await signup(signer, accountAddress, syncServerUri, storage, identityToken);
  } else {
    authData = await restoreKeys(signer, accountAddress, syncServerUri, storage, identityToken);
  }
  store.send({ type: 'reset' });
  store.send({
    ...authData,
    sessionToken: 'dummy', // not needed in the connect app
    type: 'setAuth',
  });
}
