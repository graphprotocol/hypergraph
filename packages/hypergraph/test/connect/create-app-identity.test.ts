import { isAddress } from 'viem';
import { describe, expect, it } from 'vitest';
import { createAppIdentity } from '../../src/connect/create-app-identity.js';

describe('createAppIdentity', () => {
  it('should return a valid object with correct structure and types', () => {
    const result = createAppIdentity();

    // Check that the result is an object
    expect(result).toBeTypeOf('object');
    expect(result).not.toBeNull();

    // Check that all required properties exist
    expect(result).toHaveProperty('encryptionPublicKey');
    expect(result).toHaveProperty('encryptionPrivateKey');
    expect(result).toHaveProperty('signaturePublicKey');
    expect(result).toHaveProperty('signaturePrivateKey');
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('addressPrivateKey');

    // Check that all properties are strings
    expect(result.encryptionPublicKey).toBeTypeOf('string');
    expect(result.encryptionPrivateKey).toBeTypeOf('string');
    expect(result.signaturePublicKey).toBeTypeOf('string');
    expect(result.signaturePrivateKey).toBeTypeOf('string');
    expect(result.address).toBeTypeOf('string');
    expect(result.addressPrivateKey).toBeTypeOf('string');
  });

  it('should return values with correct lengths', () => {
    const result = createAppIdentity();

    // Encryption keys (32 bytes = 64 hex chars + 2 for '0x' prefix = 66 total)
    expect(result.encryptionPublicKey).toHaveLength(66);
    expect(result.encryptionPrivateKey).toHaveLength(66);

    // Signature keys (secp256k1 public key compressed = 33 bytes = 66 hex chars + 2 for '0x' prefix = 68 total)
    // Private key = 32 bytes = 64 hex chars + 2 for '0x' prefix = 66 total
    expect(result.signaturePublicKey).toHaveLength(68);
    expect(result.signaturePrivateKey).toHaveLength(66);

    // Address should be 42 characters (20 bytes = 40 hex chars + 2 for '0x' prefix)
    expect(result.address).toHaveLength(42);

    // Address private key should be 66 characters (32 bytes = 64 hex chars + 2 for '0x' prefix)
    expect(result.addressPrivateKey).toHaveLength(66);
  });

  it('should return values with correct hex format', () => {
    const result = createAppIdentity();

    // All hex values should start with '0x'
    expect(result.encryptionPublicKey).toMatch(/^0x[0-9a-fA-F]+$/);
    expect(result.encryptionPrivateKey).toMatch(/^0x[0-9a-fA-F]+$/);
    expect(result.signaturePublicKey).toMatch(/^0x[0-9a-fA-F]+$/);
    expect(result.signaturePrivateKey).toMatch(/^0x[0-9a-fA-F]+$/);
    expect(result.address).toMatch(/^0x[0-9a-fA-F]+$/);
    expect(result.addressPrivateKey).toMatch(/^0x[0-9a-fA-F]+$/);
  });

  it('should return a valid Ethereum address', () => {
    const result = createAppIdentity();

    // Use viem's isAddress to validate the address format
    expect(isAddress(result.address)).toBe(true);
  });

  it('should return unique values on multiple calls', () => {
    const result1 = createAppIdentity();
    const result2 = createAppIdentity();

    // All generated values should be different
    expect(result1.encryptionPublicKey).not.toBe(result2.encryptionPublicKey);
    expect(result1.encryptionPrivateKey).not.toBe(result2.encryptionPrivateKey);
    expect(result1.signaturePublicKey).not.toBe(result2.signaturePublicKey);
    expect(result1.signaturePrivateKey).not.toBe(result2.signaturePrivateKey);
    expect(result1.address).not.toBe(result2.address);
    expect(result1.addressPrivateKey).not.toBe(result2.addressPrivateKey);
  });

  it('should have non-empty string values', () => {
    const result = createAppIdentity();

    // All values should be non-empty strings
    expect(result.encryptionPublicKey.length).toBeGreaterThan(0);
    expect(result.encryptionPrivateKey.length).toBeGreaterThan(0);
    expect(result.signaturePublicKey.length).toBeGreaterThan(0);
    expect(result.signaturePrivateKey.length).toBeGreaterThan(0);
    expect(result.address.length).toBeGreaterThan(0);
    expect(result.addressPrivateKey.length).toBeGreaterThan(0);

    // Ensure they're not just whitespace
    expect(result.encryptionPublicKey.trim()).toBe(result.encryptionPublicKey);
    expect(result.encryptionPrivateKey.trim()).toBe(result.encryptionPrivateKey);
    expect(result.signaturePublicKey.trim()).toBe(result.signaturePublicKey);
    expect(result.signaturePrivateKey.trim()).toBe(result.signaturePrivateKey);
    expect(result.address.trim()).toBe(result.address);
    expect(result.addressPrivateKey.trim()).toBe(result.addressPrivateKey);
  });
});
