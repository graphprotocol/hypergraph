import { randomBytes } from '@noble/ciphers/webcrypto';
import { encryptKeyBox } from './key-box.js';

type Params = {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  key: Uint8Array;
};

export function encryptKey({ privateKey, publicKey, key }: Params): {
  keyBoxCiphertext: Uint8Array;
  keyBoxNonce: Uint8Array;
} {
  const nonce = randomBytes(24);

  const ciphertext = encryptKeyBox({
    message: key,
    nonce,
    publicKey,
    secretKey: privateKey,
  });

  return {
    keyBoxCiphertext: ciphertext,
    keyBoxNonce: nonce,
  };
}
