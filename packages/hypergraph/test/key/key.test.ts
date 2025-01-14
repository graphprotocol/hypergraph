import { randomBytes } from '@noble/ciphers/webcrypto';
import { describe, expect, it } from 'vitest';

import { createKey } from '../../src/key/create-key.js';
import { encryptKey } from '../../src/key/encrypt-key.js';
import { decryptKeyBox, generateKeypair } from '../../src/key/key-box.js';

describe('Key Encryption', () => {
  describe('encryptKey', () => {
    it('should encrypt a provided key with correct output structure', () => {
      const { publicKey, secretKey } = generateKeypair();
      const key = randomBytes(32);

      const result = encryptKey({
        privateKey: secretKey,
        publicKey,
        key,
      });

      expect(result).toHaveProperty('keyBoxCiphertext');
      expect(result).toHaveProperty('keyBoxNonce');
      expect(result.keyBoxCiphertext).toBeInstanceOf(Uint8Array);
      expect(result.keyBoxNonce).toBeInstanceOf(Uint8Array);
      expect(result.keyBoxNonce.length).toBe(24);
    });

    it('should generate different nonces for same key', () => {
      const { publicKey, secretKey } = generateKeypair();
      const key = randomBytes(32);

      const result1 = encryptKey({
        privateKey: secretKey,
        publicKey,
        key,
      });

      const result2 = encryptKey({
        privateKey: secretKey,
        publicKey,
        key,
      });

      expect(Buffer.from(result1.keyBoxNonce)).not.toEqual(Buffer.from(result2.keyBoxNonce));
      expect(Buffer.from(result1.keyBoxCiphertext)).not.toEqual(Buffer.from(result2.keyBoxCiphertext));
    });

    it('should be decryptable with correct keys', () => {
      const alice = generateKeypair();
      const bob = generateKeypair();
      const originalKey = randomBytes(32);

      const { keyBoxCiphertext, keyBoxNonce } = encryptKey({
        privateKey: alice.secretKey,
        publicKey: bob.publicKey,
        key: originalKey,
      });

      const decryptedKey = decryptKeyBox({
        ciphertext: keyBoxCiphertext,
        nonce: keyBoxNonce,
        publicKey: alice.publicKey,
        secretKey: bob.secretKey,
      });

      expect(Buffer.from(decryptedKey)).toEqual(Buffer.from(originalKey));
    });

    it('should handle keys of different lengths', () => {
      const { publicKey, secretKey } = generateKeypair();
      const keyLengths = [16, 24, 32, 48];

      for (const length of keyLengths) {
        const key = randomBytes(length);

        const result = encryptKey({
          privateKey: secretKey,
          publicKey,
          key,
        });

        expect(result.keyBoxCiphertext.length).toBeGreaterThan(length); // Account for MAC
        expect(result.keyBoxNonce.length).toBe(24);
      }
    });
  });

  describe('createKey', () => {
    it('should create a new key with correct structure', () => {
      const { publicKey, secretKey } = generateKeypair();

      const result = createKey({
        privateKey: secretKey,
        publicKey,
      });

      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('keyBoxCiphertext');
      expect(result).toHaveProperty('keyBoxNonce');
      expect(result.key).toBeInstanceOf(Uint8Array);
      expect(result.key.length).toBe(32);
      expect(result.keyBoxCiphertext).toBeInstanceOf(Uint8Array);
      expect(result.keyBoxNonce).toBeInstanceOf(Uint8Array);
      expect(result.keyBoxNonce.length).toBe(24);
    });

    it('should generate unique keys on each call', () => {
      const { publicKey, secretKey } = generateKeypair();

      const result1 = createKey({
        privateKey: secretKey,
        publicKey,
      });

      const result2 = createKey({
        privateKey: secretKey,
        publicKey,
      });

      expect(Buffer.from(result1.key)).not.toEqual(Buffer.from(result2.key));
      expect(Buffer.from(result1.keyBoxNonce)).not.toEqual(Buffer.from(result2.keyBoxNonce));
      expect(Buffer.from(result1.keyBoxCiphertext)).not.toEqual(Buffer.from(result2.keyBoxCiphertext));
    });

    it('should create decryptable keys', () => {
      const alice = generateKeypair();
      const bob = generateKeypair();

      const { key, keyBoxCiphertext, keyBoxNonce } = createKey({
        privateKey: alice.secretKey,
        publicKey: bob.publicKey,
      });

      const decryptedKey = decryptKeyBox({
        ciphertext: keyBoxCiphertext,
        nonce: keyBoxNonce,
        publicKey: alice.publicKey,
        secretKey: bob.secretKey,
      });

      expect(Buffer.from(decryptedKey)).toEqual(Buffer.from(key));
    });
  });

  describe('integration tests', () => {
    it('should work with multiple recipients', () => {
      const sender = generateKeypair();
      const recipients = Array.from({ length: 5 }, () => generateKeypair());
      const key = randomBytes(32);

      // Encrypt same key for multiple recipients
      const encryptedKeys = recipients.map((recipient) =>
        encryptKey({
          privateKey: sender.secretKey,
          publicKey: recipient.publicKey,
          key,
        }),
      );

      // Each recipient should be able to decrypt their version
      recipients.forEach((recipient, index) => {
        const decryptedKey = decryptKeyBox({
          ciphertext: encryptedKeys[index].keyBoxCiphertext,
          nonce: encryptedKeys[index].keyBoxNonce,
          publicKey: sender.publicKey,
          secretKey: recipient.secretKey,
        });

        expect(Buffer.from(decryptedKey)).toEqual(Buffer.from(key));
      });
    });

    it('should fail decryption with wrong keys', () => {
      const alice = generateKeypair();
      const bob = generateKeypair();
      const eve = generateKeypair();
      const key = randomBytes(32);

      const { keyBoxCiphertext, keyBoxNonce } = encryptKey({
        privateKey: alice.secretKey,
        publicKey: bob.publicKey,
        key,
      });

      expect(() =>
        decryptKeyBox({
          ciphertext: keyBoxCiphertext,
          nonce: keyBoxNonce,
          publicKey: alice.publicKey,
          secretKey: eve.secretKey, // Wrong key
        }),
      ).toThrow();
    });

    it('should create and encrypt keys consistently', () => {
      const alice = generateKeypair();
      const bob = generateKeypair();

      // Create a key using createKey
      const {
        key: createdKey,
        keyBoxCiphertext: createdCiphertext,
        keyBoxNonce: createdNonce,
      } = createKey({
        privateKey: alice.secretKey,
        publicKey: bob.publicKey,
      });

      // Encrypt the same key using encryptKey
      const { keyBoxCiphertext: encryptedCiphertext, keyBoxNonce: encryptedNonce } = encryptKey({
        privateKey: alice.secretKey,
        publicKey: bob.publicKey,
        key: createdKey,
      });

      // Both should be decryptable to the same key
      const decryptedCreated = decryptKeyBox({
        ciphertext: createdCiphertext,
        nonce: createdNonce,
        publicKey: alice.publicKey,
        secretKey: bob.secretKey,
      });

      const decryptedEncrypted = decryptKeyBox({
        ciphertext: encryptedCiphertext,
        nonce: encryptedNonce,
        publicKey: alice.publicKey,
        secretKey: bob.secretKey,
      });

      expect(Buffer.from(decryptedCreated)).toEqual(Buffer.from(createdKey));
      expect(Buffer.from(decryptedEncrypted)).toEqual(Buffer.from(createdKey));
    });
  });
});
