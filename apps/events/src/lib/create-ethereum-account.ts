import { bytesToHex, randomBytes } from '@noble/hashes/utils';
import { privateKeyToAccount } from 'viem/accounts';

export const createEthereumAccount = () => {
  const privateKey = `0x${bytesToHex(randomBytes(32))}` as `0x${string}`;
  const account = privateKeyToAccount(privateKey);
  return {
    privateKey,
    address: account.address,
  };
};
