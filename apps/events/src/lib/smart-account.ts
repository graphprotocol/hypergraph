import { getWalletClient } from '@graphprotocol/grc-20';
import type { Hex } from 'viem';

const privateKey = import.meta.env.VITE_ACCOUNT_KEY as Hex;

export const getSmartAccountWalletClient = async () => {
  try {
    // return await grc20getSmartAccountWalletClient({
    //   privateKey,
    // });
    return await getWalletClient({
      privateKey,
    });
  } catch (err) {
    return undefined;
  }
};
