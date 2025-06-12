import * as Schema from 'effect/Schema';
import * as Messages from '../messages/index.js';
import { store } from '../store.js';
import { verifyIdentityOwnership } from './prove-ownership.js';

export const getVerifiedIdentity = async (
  accountAddress: string,
  syncServerUri: string,
): Promise<{
  accountAddress: string;
  encryptionPublicKey: string;
  signaturePublicKey: string;
}> => {
  const storeState = store.getSnapshot();
  const identity = storeState.context.identities[accountAddress];
  if (identity) {
    return {
      accountAddress,
      encryptionPublicKey: identity.encryptionPublicKey,
      signaturePublicKey: identity.signaturePublicKey,
    };
  }
  const res = await fetch(`${syncServerUri}/identity?accountAddress=${accountAddress}`);
  if (res.status !== 200) {
    throw new Error('Failed to fetch identity');
  }
  const resDecoded = Schema.decodeUnknownSync(Messages.ResponseIdentity)(await res.json());

  if (
    !(await verifyIdentityOwnership(
      resDecoded.accountAddress,
      resDecoded.signaturePublicKey,
      resDecoded.accountProof,
      resDecoded.keyProof,
    ))
  ) {
    throw new Error('Invalid identity');
  }

  store.send({
    type: 'addVerifiedIdentity',
    accountAddress: resDecoded.accountAddress,
    encryptionPublicKey: resDecoded.encryptionPublicKey,
    signaturePublicKey: resDecoded.signaturePublicKey,
    accountProof: resDecoded.accountProof,
    keyProof: resDecoded.keyProof,
  });
  return {
    accountAddress: resDecoded.accountAddress,
    encryptionPublicKey: resDecoded.encryptionPublicKey,
    signaturePublicKey: resDecoded.signaturePublicKey,
  };
};
