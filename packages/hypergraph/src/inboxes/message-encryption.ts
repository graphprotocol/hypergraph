import { cryptoBoxSeal, cryptoBoxSealOpen } from '@serenity-kit/noble-sodium';
import { bytesToHex, hexToBytes, stringToUint8Array, uint8ArrayToString } from '../utils/index.js';

type EncryptParams = {
  message: string;
  encryptionPublicKey: string;
};

type DecryptParams = {
  ciphertext: string;
  encryptionPrivateKey: string;
  encryptionPublicKey: string;
};

export function encryptInboxMessage({ message, encryptionPublicKey }: EncryptParams): {
  ciphertext: string;
} {
  const ciphertext = cryptoBoxSeal({
    message: stringToUint8Array(message),
    publicKey: hexToBytes(encryptionPublicKey),
  });

  return { ciphertext: bytesToHex(ciphertext) };
}

export function decryptInboxMessage({ ciphertext, encryptionPrivateKey, encryptionPublicKey }: DecryptParams): string {
  const publicKey = hexToBytes(encryptionPublicKey);
  const privateKey = hexToBytes(encryptionPrivateKey);
  const message = cryptoBoxSealOpen({
    ciphertext: hexToBytes(ciphertext),
    privateKey,
    publicKey,
  });
  return uint8ArrayToString(message);
}
