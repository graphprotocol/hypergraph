import { decryptKeyBox } from './key-box.js';

type Params = {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  keyBoxCiphertext: Uint8Array;
  keyBoxNonce: Uint8Array;
};

export function decryptKey({ privateKey, publicKey, keyBoxNonce, keyBoxCiphertext }: Params): Uint8Array {
  const key = decryptKeyBox({
    nonce: keyBoxNonce,
    ciphertext: keyBoxCiphertext,
    publicKey,
    secretKey: privateKey,
  });

  return key;
}
