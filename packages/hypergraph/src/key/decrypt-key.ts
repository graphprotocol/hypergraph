import { decryptKeyBox } from './key-box.js';

export type DecryptKeyParams = {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  keyBoxCiphertext: Uint8Array;
  keyBoxNonce: Uint8Array;
};
export function decryptKey({ privateKey, publicKey, keyBoxNonce, keyBoxCiphertext }: DecryptKeyParams): Uint8Array {
  return decryptKeyBox({
    nonce: keyBoxNonce,
    ciphertext: keyBoxCiphertext,
    publicKey,
    secretKey: privateKey,
  });
}
