import { publicKeyToAddress } from '@graph-framework/utils';
import type { Hex } from '@graph-framework/utils';
import { verifyMessage } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type { Keys, Signer } from './types.js';

export const getAccountProofMessage = (accountId: string, publicKey: string): string => {
  return `This message proves I am the owner of the account ${accountId} and the public key ${publicKey}`;
};

export const getKeyProofMessage = (accountId: string, publicKey: string): string => {
  return `The public key ${publicKey} is owned by the account ${accountId}`;
};

export const proveIdentityOwnership = async (
  signer: Signer,
  accountId: string,
  keys: Keys,
): Promise<{ accountProof: Hex; keyProof: Hex }> => {
  const publicKey = keys.signaturePublicKey;
  const accountProofMessage = getAccountProofMessage(accountId, publicKey);
  const keyProofMessage = getKeyProofMessage(accountId, publicKey);
  const accountProof = (await signer.signMessage(accountProofMessage)) as Hex;
  const account = privateKeyToAccount(keys.signaturePrivateKey);
  const keyProof = (await account.signMessage({ message: keyProofMessage })) as Hex;
  return { accountProof, keyProof };
};

export const verifyIdentityOwnership = async (
  accountId: string,
  publicKey: Hex,
  accountProof: Hex,
  keyProof: Hex,
): Promise<boolean> => {
  const accountProofMessage = getAccountProofMessage(accountId, publicKey);
  const keyProofMessage = getKeyProofMessage(accountId, publicKey);
  const validAccountProof = await verifyMessage({
    address: accountId as Hex,
    message: accountProofMessage,
    signature: accountProof,
  });
  if (!validAccountProof) {
    console.log('Invalid account proof');
    return false;
  }

  const keyAddress = publicKeyToAddress(publicKey) as Hex;
  const validKeyProof = await verifyMessage({
    address: keyAddress,
    message: keyProofMessage,
    signature: keyProof,
  });
  if (!validKeyProof) {
    console.log('Invalid key proof');
    return false;
  }
  return true;
};
