import { cryptoBoxEasy, cryptoBoxKeyPair, cryptoBoxOpenEasy } from '@serenity-kit/noble-sodium';

export function generateKeypair(): {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
} {
  const { publicKey, privateKey } = cryptoBoxKeyPair();
  return { publicKey, secretKey: privateKey };
}

export type EncryptKeyBoxParams = {
  message: Uint8Array;
  nonce: Uint8Array;
  publicKey: Uint8Array;
  secretKey: Uint8Array;
};

export type DecryptKeyBoxParams = {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  publicKey: Uint8Array;
  secretKey: Uint8Array;
};

export function encryptKeyBox({ message, publicKey, secretKey, nonce }: EncryptKeyBoxParams): Uint8Array {
  return cryptoBoxEasy({ message, publicKey, privateKey: secretKey, nonce });
}

export function decryptKeyBox({ ciphertext, nonce, publicKey, secretKey }: DecryptKeyBoxParams): Uint8Array {
  return cryptoBoxOpenEasy({ ciphertext, publicKey, privateKey: secretKey, nonce });
}
