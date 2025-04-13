import { getSmartAccountWalletClient as grc20getSmartAccountWalletClient } from '@graphprotocol/grc-20';
import type { Hex } from 'viem';

const privateKey = `0x${import.meta.env.VITE_ACCOUNT_KEY}` as Hex;

export const getSmartAccountWalletClient = async () => {
  try {
    return await grc20getSmartAccountWalletClient({
      privateKey,
    });
  } catch (err) {
    return undefined;
  }
};
