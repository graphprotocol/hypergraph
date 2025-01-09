import { randomBytes } from '@noble/ciphers/webcrypto';
import { bytesToHex } from '@noble/hashes/utils';
import { describe, expect, it } from 'vitest';

import { decryptKeyBox, encryptKeyBox, generateKeypair } from '../../src/key/key-box.js';

describe('key/KeyBox Encryption/Decryption', () => {
  describe('encryptKeyBox', () => {
    it('should encrypt a message successfully', () => {
      const { publicKey, secretKey } = generateKeypair();
      console.log(bytesToHex(publicKey));
      console.log(bytesToHex(secretKey));

      const nonce = randomBytes(24);
      const message = new TextEncoder().encode('Hello, world!');

      const encrypted = encryptKeyBox({
        message,
        nonce,
        publicKey,
        secretKey,
      });

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThan(message.length); // Account for MAC
    });

    it('should throw error for invalid nonce length', () => {
      const { publicKey, secretKey } = generateKeypair();
      const invalidNonce = new Uint8Array(16); // Wrong length
      const message = new TextEncoder().encode('Hello, world!');

      expect(() =>
        encryptKeyBox({
          message,
          nonce: invalidNonce,
          publicKey,
          secretKey,
        }),
      ).toThrow('Nonce must be 24 bytes');
    });

    it('should handle empty message', () => {
      const { publicKey, secretKey } = generateKeypair();
      const nonce = randomBytes(24);
      const message = new Uint8Array(0);

      const encrypted = encryptKeyBox({
        message,
        nonce,
        publicKey,
        secretKey,
      });

      expect(encrypted).toBeInstanceOf(Uint8Array);
      expect(encrypted.length).toBeGreaterThanOrEqual(16); // At least MAC length
    });

    it('should produce different ciphertexts for same message with different nonces', () => {
      const { publicKey, secretKey } = generateKeypair();
      const nonce1 = randomBytes(24);
      const nonce2 = randomBytes(24);

      const message = new TextEncoder().encode('Hello, world!');

      const encrypted1 = encryptKeyBox({
        message,
        nonce: nonce1,
        publicKey,
        secretKey,
      });

      const encrypted2 = encryptKeyBox({
        message,
        nonce: nonce2,
        publicKey,
        secretKey,
      });

      expect(Buffer.from(encrypted1)).not.toEqual(Buffer.from(encrypted2));
    });
  });

  describe('decryptKeyBox', () => {
    it('should successfully decrypt an encrypted message', () => {
      const alice = generateKeypair();
      const bob = generateKeypair();
      const nonce = randomBytes(24);
      const message = new TextEncoder().encode('Hello, world!');

      const encrypted = encryptKeyBox({
        message,
        nonce,
        publicKey: bob.publicKey,
        secretKey: alice.secretKey,
      });

      const decrypted = decryptKeyBox({
        ciphertext: encrypted,
        nonce,
        publicKey: alice.publicKey,
        secretKey: bob.secretKey,
      });

      expect(Buffer.from(decrypted)).toEqual(Buffer.from(message));
    });

    it('should throw error for invalid nonce length during decryption', () => {
      const { publicKey, secretKey } = generateKeypair();
      const invalidNonce = new Uint8Array(16);
      const ciphertext = new Uint8Array(32);

      expect(() =>
        decryptKeyBox({
          ciphertext,
          nonce: invalidNonce,
          publicKey,
          secretKey,
        }),
      ).toThrow('Nonce must be 24 bytes');
    });

    it('should throw error for ciphertext too short', () => {
      const { publicKey, secretKey } = generateKeypair();
      const nonce = new Uint8Array(24);
      const shortCiphertext = new Uint8Array(8);

      expect(() =>
        decryptKeyBox({
          ciphertext: shortCiphertext,
          nonce,
          publicKey,
          secretKey,
        }),
      ).toThrow('Ciphertext too short');
    });

    it('should fail to decrypt with wrong keys', () => {
      const alice = generateKeypair();
      const bob = generateKeypair();
      const eve = generateKeypair(); // Attacker
      const nonce = randomBytes(24);
      const message = new TextEncoder().encode('Secret message');

      const encrypted = encryptKeyBox({
        message,
        nonce,
        publicKey: bob.publicKey,
        secretKey: alice.secretKey,
      });

      expect(() =>
        decryptKeyBox({
          ciphertext: encrypted,
          nonce,
          publicKey: alice.publicKey,
          secretKey: eve.secretKey, // Wrong key
        }),
      ).toThrow();
    });
  });

  describe('integration tests', () => {
    it('should handle messages of various lengths', () => {
      const testLengths = [0, 1, 32, 100, 1000];
      const alice = generateKeypair();
      const bob = generateKeypair();
      const nonce = randomBytes(24);

      for (const length of testLengths) {
        const message = randomBytes(length);

        const encrypted = encryptKeyBox({
          message,
          nonce,
          publicKey: bob.publicKey,
          secretKey: alice.secretKey,
        });

        const decrypted = decryptKeyBox({
          ciphertext: encrypted,
          nonce,
          publicKey: alice.publicKey,
          secretKey: bob.secretKey,
        });

        expect(Buffer.from(decrypted)).toEqual(Buffer.from(message));
      }
    });

    it('should be deterministic with same inputs', () => {
      const alice = generateKeypair();
      const bob = generateKeypair();
      const nonce = new Uint8Array(24).fill(1); // Fixed nonce
      const message = new TextEncoder().encode('Hello, world!');

      const encrypted1 = encryptKeyBox({
        message,
        nonce,
        publicKey: bob.publicKey,
        secretKey: alice.secretKey,
      });

      const encrypted2 = encryptKeyBox({
        message,
        nonce,
        publicKey: bob.publicKey,
        secretKey: alice.secretKey,
      });

      expect(Buffer.from(encrypted1)).toEqual(Buffer.from(encrypted2));
    });
  });
});
