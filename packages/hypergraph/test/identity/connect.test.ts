import { randomBytes } from '@noble/ciphers/webcrypto';
import { secp256k1 } from '@noble/curves/secp256k1';
import { type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts';
import { describe, expect, it } from 'vitest';

import type { Hex } from 'viem';

import { createIdentityKeys } from '../../src/connect/create-identity-keys.js';
import { decryptIdentity, encryptIdentity } from '../../src/identity/identity-encryption.js';
// import { proveIdentityOwnership, verifyIdentityOwnership } from '../../src/identity/prove-ownership.js';
import type { Signer } from '../../src/identity/types.js';
import { decryptKeyBox, encryptKeyBox } from '../../src/key/key-box.js';
import { bytesToHex, hexToBytes } from '../../src/utils/hexBytesAddressUtils.js';

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
    const id = createIdentityKeys();
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
    const id = createIdentityKeys();
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

    expect(new Uint8Array(decrypted)).toEqual(new Uint8Array(message));
  });
  it('should generate a signature keys able to sign and verify', () => {
    // Check that we can use the signature keypair to sign and verify
    const id = createIdentityKeys();
    const message = new TextEncoder().encode('Hello, world!');
    const sig = secp256k1.sign(message, hexToBytes(id.signaturePrivateKey));
    const valid = secp256k1.verify(sig, message, hexToBytes(id.signaturePublicKey));

    expect(valid).toBe(true);
  });
});

describe('identity encryption', () => {
  it('should encrypt and decrypt an identity using a wallet', async () => {
    // generate a random private key to simulate a user wallet
    const account = privateKeyToAccount(bytesToHex(randomBytes(32)) as Hex);
    const signer = accountSigner(account);
    const accountAddress = await signer.getAddress();
    const keys = createIdentityKeys();
    const { ciphertext, nonce } = await encryptIdentity(signer, accountAddress, keys);
    const decrypted = await decryptIdentity(signer, accountAddress, ciphertext, nonce);

    expect(decrypted.encryptionPublicKey).toEqual(keys.encryptionPublicKey);
    expect(decrypted.encryptionPrivateKey).toEqual(keys.encryptionPrivateKey);
    expect(decrypted.signaturePublicKey).toEqual(keys.signaturePublicKey);
    expect(decrypted.signaturePrivateKey).toEqual(keys.signaturePrivateKey);
  });
});

// TODO: add tests for identity ownership proofs
// These are not so easy to test now because we need to interact with a blockchain RPC
// to verify smart account signatures.
//
// describe('identity ownership proofs', () => {
//   it('should generate and verify ownership proofs', async () => {
//     // generate a random private key to simulate a user wallet
//     const account = privateKeyToAccount(bytesToHex(randomBytes(32)) as Hex);

//     const signer = accountSigner(account);
//     const accountAddress = await signer.getAddress();
//     const keys = createIdentityKeys();
//     const { accountProof, keyProof } = await proveIdentityOwnership(signer, accountAddress, keys);

//     const valid = await verifyIdentityOwnership(accountAddress, keys.signaturePublicKey, accountProof, keyProof);
//     expect(valid).toBe(true);
//   });
//   it('should fail to verify ownership proofs with invalid proofs', async () => {
//     // generate a random private key to simulate a user wallet
//     const account = privateKeyToAccount(bytesToHex(randomBytes(32)) as Hex);
//     const signer = accountSigner(account);
//     const accountAddress = await signer.getAddress();
//     const keys = createIdentityKeys();
//     const { accountProof, keyProof } = await proveIdentityOwnership(signer, accountAddress, keys);

//     // Create invalid proofs using a different account
//     const account2 = privateKeyToAccount(bytesToHex(randomBytes(32)) as Hex);
//     const signer2 = accountSigner(account2);
//     const accountAddress2 = await signer2.getAddress();
//     const keys2 = createIdentityKeys();
//     const { accountProof: accountProof2, keyProof: keyProof2 } = await proveIdentityOwnership(
//       signer2,
//       accountAddress2,
//       keys2,
//     );

//     // Check with invalid wallet proof, key proof, and with both invalid proofs
//     const valid = await verifyIdentityOwnership(accountAddress, keys.signaturePublicKey, accountProof2, keyProof);
//     expect(valid).toBe(false);

//     const valid2 = await verifyIdentityOwnership(accountAddress, keys.signaturePublicKey, accountProof, keyProof2);
//     expect(valid2).toBe(false);

//     const valid3 = await verifyIdentityOwnership(accountAddress, keys.signaturePublicKey, accountProof2, keyProof2);

//     expect(valid3).toBe(false);
//   });
// });
