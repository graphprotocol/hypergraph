import { randomBytes } from '@noble/ciphers/webcrypto';
import { secp256k1 } from '@noble/curves/secp256k1';
import { type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts';
import { describe, expect, it } from 'vitest';

import {
  loadAccountId,
  loadKeys,
  loadSyncServerSessionToken,
  storeAccountId,
  storeKeys,
  storeSyncServerSessionToken,
  wipeAccountId,
  wipeKeys,
  wipeSyncServerSessionToken,
} from '../../src/identity/auth-storage.js';
import { createIdentity } from '../../src/identity/create-identity.js';
import { decryptIdentity, encryptIdentity } from '../../src/identity/identity-encryption.js';
import { proveIdentityOwnership, verifyIdentityOwnership } from '../../src/identity/prove-ownership.js';
import type { Signer } from '../../src/identity/types.js';
import { decryptKeyBox, encryptKeyBox } from '../../src/key/key-box.js';
import { bytesToHex, hexToBytes } from '../../src/utils/hexBytesAddressUtils.js';

const storageMockDict = {} as { [key: string]: string };
const storageMock = {
  getItem: (key: string) => {
    return storageMockDict[key] || null;
  },
  setItem: (key: string, value: string) => {
    storageMockDict[key] = value;
  },
  removeItem: (key: string) => {
    delete storageMockDict[key];
  },
};

const accountSigner = (account: PrivateKeyAccount): Signer => {
  return {
    signMessage: async (message: string) => {
      return account.signMessage({ message });
    },
    getAddress: async () => {
      return account.address;
    },
  };
};

describe('createIdentity', () => {
  it('should generate an identity with signing and encryption keys', () => {
    const id = createIdentity();
    expect(id).toBeDefined();
    expect(id.encryptionPublicKey).toBeDefined();
    expect(id.encryptionPrivateKey).toBeDefined();
    expect(id.signaturePublicKey).toBeDefined();
    expect(id.signaturePrivateKey).toBeDefined();

    expect(id.encryptionPublicKey).not.toEqual(id.signaturePublicKey);
    expect(id.encryptionPrivateKey).not.toEqual(id.signaturePrivateKey);
  });
  it('should generate an encryption keys able to encrypt and decrypt', () => {
    // Check that we can use the encryption keypair to encrypt and decrypt
    const id = createIdentity();
    const nonce = randomBytes(24);
    const message = new TextEncoder().encode('Hello, world!');

    const encrypted = encryptKeyBox({
      message,
      nonce,
      publicKey: hexToBytes(id.encryptionPublicKey),
      secretKey: hexToBytes(id.encryptionPrivateKey),
    });

    const decrypted = decryptKeyBox({
      ciphertext: encrypted,
      nonce,
      publicKey: hexToBytes(id.encryptionPublicKey),
      secretKey: hexToBytes(id.encryptionPrivateKey),
    });

    expect(arraysEqual(decrypted, message)).toBe(true);
  });
  it('should generate a signature keys able to sign and verify', () => {
    // Check that we can use the signature keypair to sign and verify
    const id = createIdentity();
    const message = new TextEncoder().encode('Hello, world!');
    const sig = secp256k1.sign(message, hexToBytes(id.signaturePrivateKey));
    const valid = secp256k1.verify(sig, message, hexToBytes(id.signaturePublicKey));

    expect(valid).toBe(true);
  });
});

describe('identity encryption', () => {
  // figure out why this test is failing
  it.skip('should encrypt and decrypt an identity using a wallet', async () => {
    // generate a random private key to simulate a user wallet
    const account = privateKeyToAccount(bytesToHex(randomBytes(32)));

    const signer = accountSigner(account);
    const accountId = await signer.getAddress();
    const keys = createIdentity();
    const { ciphertext, nonce } = await encryptIdentity(signer, accountId, keys);
    const decrypted = await decryptIdentity(signer, accountId, ciphertext, nonce);

    expect(decrypted.encryptionPublicKey).toEqual(keys.encryptionPublicKey);
    expect(decrypted.encryptionPrivateKey).toEqual(keys.encryptionPrivateKey);
    expect(decrypted.signaturePublicKey).toEqual(keys.signaturePublicKey);
    expect(decrypted.signaturePrivateKey).toEqual(keys.signaturePrivateKey);
  });
});

describe('auth/identity storage', () => {
  it('stores, loads and wipes an account ID', () => {
    expect(loadAccountId(storageMock)).toBeNull();
    const accountId = '0x1234';
    storeAccountId(storageMock, accountId);
    expect(loadAccountId(storageMock)).toEqual(accountId);
    wipeAccountId(storageMock);
    expect(loadAccountId(storageMock)).toBeNull();
  });
  it('stores, loads and wipes keys', () => {
    expect(loadKeys(storageMock, '0x1234')).toBeNull();
    const keys = createIdentity();
    storeKeys(storageMock, '0x1234', keys);
    expect(loadKeys(storageMock, '0x1234')).toEqual(keys);
    wipeKeys(storageMock, '0x1234');
    expect(loadKeys(storageMock, '0x1234')).toBeNull();
  });
  it('stores, loads and wipes a session token', () => {
    expect(loadSyncServerSessionToken(storageMock, '0x1234')).toBeNull();
    const token = '0x6789';
    storeSyncServerSessionToken(storageMock, '0x1234', token);
    expect(loadSyncServerSessionToken(storageMock, '0x1234')).toEqual(token);
    wipeSyncServerSessionToken(storageMock, '0x1234');
    expect(loadSyncServerSessionToken(storageMock, '0x1234')).toBeNull();
  });
});

describe('identity ownership proofs', () => {
  it('should generate and verify ownership proofs', async () => {
    // generate a random private key to simulate a user wallet
    const account = privateKeyToAccount(bytesToHex(randomBytes(32)));

    const signer = accountSigner(account);
    const accountId = await signer.getAddress();
    const keys = createIdentity();
    const { accountProof, keyProof } = await proveIdentityOwnership(signer, accountId, keys);

    const valid = await verifyIdentityOwnership(accountId, keys.signaturePublicKey, accountProof, keyProof);
    expect(valid).toBe(true);
  });
  it('should fail to verify ownership proofs with invalid proofs', async () => {
    // generate a random private key to simulate a user wallet
    const account = privateKeyToAccount(bytesToHex(randomBytes(32)));
    const signer = accountSigner(account);
    const accountId = await signer.getAddress();
    const keys = createIdentity();
    const { accountProof, keyProof } = await proveIdentityOwnership(signer, accountId, keys);

    // Create invalid proofs using a different account
    const account2 = privateKeyToAccount(bytesToHex(randomBytes(32)));
    const signer2 = accountSigner(account2);
    const accountId2 = await signer2.getAddress();
    const keys2 = createIdentity();
    const { accountProof: accountProof2, keyProof: keyProof2 } = await proveIdentityOwnership(
      signer2,
      accountId2,
      keys2,
    );

    // Check with invalid wallet proof, key proof, and with both invalid proofs
    const valid = await verifyIdentityOwnership(accountId, keys.signaturePublicKey, accountProof2, keyProof);
    expect(valid).toBe(false);

    const valid2 = await verifyIdentityOwnership(accountId, keys.signaturePublicKey, accountProof, keyProof2);
    expect(valid2).toBe(false);

    const valid3 = await verifyIdentityOwnership(accountId, keys.signaturePublicKey, accountProof2, keyProof2);

    expect(valid3).toBe(false);
  });
});

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
