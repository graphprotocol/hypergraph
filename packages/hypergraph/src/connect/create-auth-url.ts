import { bytesToHex, randomBytes } from '@noble/hashes/utils';
import { generateKeypair } from '../key/key-box.js';
import type { ConnectAuthPayload } from '../types.js';

type CreateAuthUrlParams = {
  connectUrl: string;
  redirectUrl: string;
  appId: string;
  expiryMilliseconds?: number;
};

export const createAuthUrl = (params: CreateAuthUrlParams) => {
  const {
    redirectUrl,
    connectUrl,
    expiryMilliseconds = 240000, // 4 minutes
    appId,
  } = params;
  const { publicKey, secretKey } = generateKeypair();

  const expiry = Date.now() + expiryMilliseconds;
  const payload: ConnectAuthPayload = {
    expiry,
    encryptionPublicKey: bytesToHex(publicKey),
    appId,
  };
  const data = encodeURIComponent(JSON.stringify(payload));
  const nonce = bytesToHex(randomBytes(32));

  const url = new URL(connectUrl);
  url.searchParams.set('data', data);
  url.searchParams.set('redirect', encodeURIComponent(redirectUrl));
  url.searchParams.set('nonce', nonce);

  return {
    url,
    nonce,
    secretKey: bytesToHex(secretKey),
    publicKey: bytesToHex(publicKey),
    expiry,
  };
};
