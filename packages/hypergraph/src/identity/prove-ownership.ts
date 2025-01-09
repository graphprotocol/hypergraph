import { type Hex, verifyMessage } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { publicKeyToAddress } from '../utils/hexBytesAddressUtils.js';

import type { Keys, Signer } from './types.js';

export function getAccountProofMessage(accountId: string, publicKey: string): string {
  return `This message proves I am the owner of the account ${accountId} and the public key ${publicKey}`;
}

export function getKeyProofMessage(accountId: string, publicKey: string): string {
  return `The public key ${publicKey} is owned by the account ${accountId}`;
}

export async function proveIdentityOwnership(
  signer: Signer,
  accountId: string,
  keys: Keys,
): Promise<{ accountProof: string; keyProof: string }> {
  const publicKey = keys.signaturePublicKey;
  const accountProofMessage = getAccountProofMessage(accountId, publicKey);
  const keyProofMessage = getKeyProofMessage(accountId, publicKey);
  const accountProof = await signer.signMessage(accountProofMessage);
  const account = privateKeyToAccount(keys.signaturePrivateKey as Hex);
  const keyProof = await account.signMessage({ message: keyProofMessage });
  return { accountProof, keyProof };
}

export async function verifyIdentityOwnership(
  accountId: string,
  publicKey: string,
  accountProof: string,
  keyProof: string,
): Promise<boolean> {
  const accountProofMessage = getAccountProofMessage(accountId, publicKey);
  const keyProofMessage = getKeyProofMessage(accountId, publicKey);
  const validAccountProof = await verifyMessage({
    address: accountId as Hex,
    message: accountProofMessage,
    signature: accountProof as Hex,
  });
  if (!validAccountProof) {
    console.log('Invalid account proof');
    return false;
  }

  const keyAddress = publicKeyToAddress(publicKey) as Hex;
  const validKeyProof = await verifyMessage({
    address: keyAddress,
    message: keyProofMessage,
    signature: keyProof as Hex,
  });
  if (!validKeyProof) {
    console.log('Invalid key proof');
    return false;
  }
  return true;
}
