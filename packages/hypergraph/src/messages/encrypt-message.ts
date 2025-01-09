import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/ciphers/webcrypto';

export type EncryptMessageParams = {
  message: Uint8Array;
  secretKey: Uint8Array;
};
export function encryptMessage({ message, secretKey }: EncryptMessageParams) {
  const nonce = randomBytes(24);
  const cipher = xchacha20poly1305(secretKey, nonce);
  const ciphertext = cipher.encrypt(message);
  return new Uint8Array([...nonce, ...ciphertext]);
}
