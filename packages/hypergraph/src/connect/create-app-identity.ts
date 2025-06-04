import type { Hex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createIdentityKeys } from './create-identity-keys.js';
import type { IdentityKeys } from './types.js';

export const createAppIdentity = (): IdentityKeys & { address: string; addressPrivateKey: Hex } => {
  const keys = createIdentityKeys();
  const addressPrivateKey = generatePrivateKey();
  const { address } = privateKeyToAccount(addressPrivateKey);

  return {
    ...keys,
    address,
    addressPrivateKey,
  };
};
