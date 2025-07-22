import * as Schema from 'effect/Schema';
import type { Chain } from 'viem';
import * as Messages from '../messages/index.js';
import { store } from '../store.js';
import { verifyIdentityOwnership } from './prove-ownership.js';

export const getVerifiedIdentity = async (
  accountAddress: string,
  signaturePublicKey: string | null,
  appId: string | null,
  syncServerUri: string,
  chain: Chain,
  rpcUrl: string,
): Promise<{
  accountAddress: string;
  encryptionPublicKey: string;
  signaturePublicKey: string;
}> => {
  if (signaturePublicKey && appId) {
    throw new Error('Cannot specify both signaturePublicKey and appId');
  }
  if (!signaturePublicKey && !appId) {
    throw new Error('Must specify either signaturePublicKey or appId');
  }
  const storeState = store.getSnapshot();
  const identity = storeState.context.identities[accountAddress]?.find((identity) => {
    if (signaturePublicKey) {
      return identity.signaturePublicKey === signaturePublicKey;
    }
    return identity.appId === appId;
  });
  if (identity) {
    return {
      accountAddress,
      encryptionPublicKey: identity.encryptionPublicKey,
      signaturePublicKey: identity.signaturePublicKey,
    };
  }
  const query = signaturePublicKey ? `&signaturePublicKey=${signaturePublicKey}` : `&appId=${appId}`;
  const res = await fetch(`${syncServerUri}/identity?accountAddress=${accountAddress}${query}`);
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
      chain,
      rpcUrl,
    ))
  ) {
    throw new Error('Invalid identity in getVerifiedIdentity');
  }

  store.send({
    type: 'addVerifiedIdentity',
    accountAddress: resDecoded.accountAddress,
    encryptionPublicKey: resDecoded.encryptionPublicKey,
    signaturePublicKey: resDecoded.signaturePublicKey,
    accountProof: resDecoded.accountProof,
    keyProof: resDecoded.keyProof,
    appId: resDecoded.appId ?? null,
  });
  return {
    accountAddress: resDecoded.accountAddress,
    encryptionPublicKey: resDecoded.encryptionPublicKey,
    signaturePublicKey: resDecoded.signaturePublicKey,
  };
};
