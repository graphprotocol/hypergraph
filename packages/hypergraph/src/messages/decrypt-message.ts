import { xchacha20poly1305 } from '@noble/ciphers/chacha';

export type DecryptMessageParams = {
  nonceAndCiphertext: Uint8Array;
  secretKey: Uint8Array;
};
export function decryptMessage({ nonceAndCiphertext, secretKey }: DecryptMessageParams) {
  const nonce = nonceAndCiphertext.subarray(0, 24);
  const ciphertext = nonceAndCiphertext.subarray(24);
  const cipher = xchacha20poly1305(secretKey, nonce);
  return cipher.decrypt(ciphertext);
}
