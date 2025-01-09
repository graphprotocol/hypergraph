import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { x25519 } from '@noble/curves/ed25519';
import { blake2b } from '@noble/hashes/blake2b';

const NONCE_LENGTH = 24;
const MAC_LENGTH = 16;

type EncryptKeyBoxParams = {
  message: Uint8Array;
  nonce: Uint8Array;
  publicKey: Uint8Array;
  secretKey: Uint8Array;
};

export function generateKeypair() {
  const secretKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(secretKey);
  return { publicKey, secretKey } as const;
}

export function encryptKeyBox({ message, nonce, publicKey, secretKey }: EncryptKeyBoxParams): Uint8Array {
  if (nonce.length !== NONCE_LENGTH) {
    throw new Error(`Nonce must be ${NONCE_LENGTH} bytes`);
  }

  // Compute shared key using X25519
  const sharedSecret = x25519.getSharedSecret(secretKey, publicKey);

  // Derive symmetric key using BLAKE2b
  const key = blake2b.create({ dkLen: 32 }).update(sharedSecret).digest();

  // Encrypt using XChaCha20-Poly1305
  const cipher = xchacha20poly1305(key, nonce);

  return cipher.encrypt(message);
}

export type DecryptKeyBoxParams = {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  publicKey: Uint8Array;
  secretKey: Uint8Array;
};
export function decryptKeyBox({ ciphertext, nonce, publicKey, secretKey }: DecryptKeyBoxParams): Uint8Array {
  if (nonce.length !== NONCE_LENGTH) {
    throw new Error(`Nonce must be ${NONCE_LENGTH} bytes`);
  }

  if (ciphertext.length < MAC_LENGTH) {
    throw new Error('Ciphertext too short');
  }

  // Compute shared key using X25519
  const sharedSecret = x25519.getSharedSecret(secretKey, publicKey);

  // Derive symmetric key using BLAKE2b
  const key = blake2b.create({ dkLen: 32 }).update(sharedSecret).digest();

  // Decrypt using XChaCha20-Poly1305
  const cipher = xchacha20poly1305(key, nonce);

  return cipher.decrypt(ciphertext);
}
