import * as Schema from 'effect/Schema';
import * as Messages from '../messages/index.js';
import { store } from '../store.js';
import { verifyIdentityOwnership } from './prove-ownership.js';

export const getVerifiedIdentity = async (
  accountId: string,
  syncServerUri: string,
): Promise<{
  accountId: string;
  encryptionPublicKey: string;
  signaturePublicKey: string;
}> => {
  const storeState = store.getSnapshot();
  const identity = storeState.context.identities[accountId];
  if (identity) {
    return {
      accountId,
      encryptionPublicKey: identity.encryptionPublicKey,
      signaturePublicKey: identity.signaturePublicKey,
    };
  }
  const res = await fetch(`${syncServerUri}/identity?accountId=${accountId}`);
  if (res.status !== 200) {
    throw new Error('Failed to fetch identity');
  }
  const resDecoded = Schema.decodeUnknownSync(Messages.ResponseIdentity)(await res.json());

  if (
    !(await verifyIdentityOwnership(
      resDecoded.accountId,
      resDecoded.signaturePublicKey,
      resDecoded.accountProof,
      resDecoded.keyProof,
    ))
  ) {
    throw new Error('Invalid identity');
  }

  store.send({
    type: 'addVerifiedIdentity',
    accountId: resDecoded.accountId,
    encryptionPublicKey: resDecoded.encryptionPublicKey,
    signaturePublicKey: resDecoded.signaturePublicKey,
    accountProof: resDecoded.accountProof,
    keyProof: resDecoded.keyProof,
  });
  return {
    accountId: resDecoded.accountId,
    encryptionPublicKey: resDecoded.encryptionPublicKey,
    signaturePublicKey: resDecoded.signaturePublicKey,
  };
};
