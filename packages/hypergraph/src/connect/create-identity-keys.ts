import { secp256k1 } from '@noble/curves/secp256k1';

import { generateKeypair } from '../key/index.js';
import { bytesToHex } from '../utils/index.js';
import type { IdentityKeys } from './types.js';

export const createIdentityKeys = (): IdentityKeys => {
  // generate a random private key for encryption
  const { publicKey: encryptionPublicKey, secretKey: encryptionPrivateKey } = generateKeypair();
  // generate a random private key for signing
  const signaturePrivateKey = secp256k1.utils.randomPrivateKey();
  const signaturePublicKey = secp256k1.getPublicKey(signaturePrivateKey);

  return {
    encryptionPublicKey: bytesToHex(encryptionPublicKey),
    encryptionPrivateKey: bytesToHex(encryptionPrivateKey),
    signaturePublicKey: bytesToHex(signaturePublicKey),
    signaturePrivateKey: bytesToHex(signaturePrivateKey),
  };
};
