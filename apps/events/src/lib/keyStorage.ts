import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

export const getEnv = (): 'dev' | 'production' | 'local' => {
  return 'dev';
};

export const buildLocalStorageKey = (walletAddress: string) =>
  walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : '';

export const loadKeys = (walletAddress: string): Uint8Array | null => {
  const accessKey = buildLocalStorageKey(walletAddress);
  const val = localStorage.getItem(accessKey);
  return val ? hexToBytes(val) : null;
};

export const storeKeys = (walletAddress: string, keys: Uint8Array) => {
  localStorage.setItem(buildLocalStorageKey(walletAddress), bytesToHex(keys));
};

export const wipeKeys = (walletAddress: string) => {
  // This will clear the conversation cache + the private keys
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};
