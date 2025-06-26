import { createPublicClient, http, verifyMessage, type Chain, type Hex, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import type { SmartAccountClient } from 'permissionless';
import { publicKeyToAddress } from '../utils/index.js';
import type { IdentityKeys } from './types.js';

export const getAccountProofMessage = (accountAddress: string, publicKey: string): string => {
  return `This message proves I am the owner of the account ${accountAddress} and the public key ${publicKey}`;
};

export const getKeyProofMessage = (accountAddress: string, publicKey: string): string => {
  return `The public key ${publicKey} is owned by the account ${accountAddress}`;
};

export const accountProofDomain = {
  name: 'Hypergraph',
  version: '1',
};

export const proveIdentityOwnership = async (
  walletClient: WalletClient,
  smartAccountClient: SmartAccountClient,
  accountAddress: string,
  keys: IdentityKeys,
): Promise<{ accountProof: string; keyProof: string }> => {
  if (!smartAccountClient.account) {
    throw new Error('Smart account client does not have an account');
  }
  if (!smartAccountClient.chain) {
    throw new Error('Smart account client does not have a chain');
  }
  const publicKey = keys.signaturePublicKey;
  const keyProofMessage = getKeyProofMessage(accountAddress, publicKey);

  const accountProof = await smartAccountClient.account.signTypedData({
    message: {
      message: getAccountProofMessage(accountAddress, publicKey),
    },
    types: {
      Message: [{ name: 'message', type: 'string' }],
    },
    domain: accountProofDomain,
    primaryType: 'Message',
  });
  console.log('accountProof', accountProof);
  const account = privateKeyToAccount(keys.signaturePrivateKey as Hex);
  const keyProof = await account.signMessage({ message: keyProofMessage });
  return { accountProof, keyProof };
};

export const verifyIdentityOwnership = async (
  accountAddress: string,
  publicKey: string,
  accountProof: string,
  keyProof: string,
  chain: Chain,
  rpcUrl: string,
): Promise<boolean> => {
  const keyProofMessage = getKeyProofMessage(accountAddress, publicKey);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  // console.log('publicClient', publicClient);
  // console.log('rpcUrl', rpcUrl);
  // console.log('chain', chain);

  // console.log('accountProof', accountProof);
  // console.log('accountAddress', accountAddress);
  // console.log('publicKey', publicKey);

  const accountProofMessage = getAccountProofMessage(accountAddress, publicKey);
  const validAccountProof = await publicClient.verifyTypedData({
    address: accountAddress as Hex,
    message: {
      message: accountProofMessage,
    },
    types: {
      Message: [{ name: 'message', type: 'string' }],
    },
    domain: accountProofDomain,
    primaryType: 'Message',
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
