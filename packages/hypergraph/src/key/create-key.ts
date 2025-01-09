import { randomBytes } from '@noble/ciphers/webcrypto';

import { encryptKey } from './encrypt-key.js';

export type CreateKeyParams = {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
};
export function createKey({ privateKey, publicKey }: CreateKeyParams): Readonly<{
  key: Uint8Array;
  keyBoxCiphertext: Uint8Array;
  keyBoxNonce: Uint8Array;
}> {
  const key = randomBytes(32);

  const { keyBoxCiphertext, keyBoxNonce } = encryptKey({
    key,
    publicKey,
    privateKey,
  });

  return {
    key,
    keyBoxCiphertext,
    keyBoxNonce,
  } as const;
}
