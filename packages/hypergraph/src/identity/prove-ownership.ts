import { http, type Account, type Chain, type Hex, createPublicClient, verifyMessage } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import type { SmartAccountClient } from 'permissionless';
import { DEFAULT_RPC_URL, GEOGENESIS } from '../connect/smart-account.js';
import { publicKeyToAddress } from '../utils/index.js';
import type { IdentityKeys } from './types.js';

export const getAccountProofMessage = (accountAddress: string, publicKey: string): string => {
  return `This message proves I am the owner of the account ${accountAddress} and the public key ${publicKey}`;
};

export const getKeyProofMessage = (accountAddress: string, publicKey: string): string => {
  return `The public key ${publicKey} is owned by the account ${accountAddress}`;
};

export const proveIdentityOwnership = async (
  smartAccountClient: SmartAccountClient,
  accountAddress: string,
  keys: IdentityKeys,
): Promise<{ accountProof: string; keyProof: string }> => {
  const publicKey = keys.signaturePublicKey;
  const accountProofMessage = getAccountProofMessage(accountAddress, publicKey);
  const keyProofMessage = getKeyProofMessage(accountAddress, publicKey);
  const accountProof = await smartAccountClient.signMessage({
    account: smartAccountClient.account as Account,
    message: accountProofMessage,
  });
  const account = privateKeyToAccount(keys.signaturePrivateKey as Hex);
  const keyProof = await account.signMessage({ message: keyProofMessage });
  return { accountProof, keyProof };
};

export const verifyIdentityOwnership = async (
  accountAddress: string,
  publicKey: string,
  accountProof: string,
  keyProof: string,
  chain: Chain = GEOGENESIS,
  rpcUrl: string = DEFAULT_RPC_URL,
): Promise<boolean> => {
  const accountProofMessage = getAccountProofMessage(accountAddress, publicKey);
  const keyProofMessage = getKeyProofMessage(accountAddress, publicKey);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const validAccountProof = await publicClient.verifyMessage({
    address: accountAddress as Hex,
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
};
