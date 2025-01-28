import { gcm } from '@noble/ciphers/aes';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import type { Hex } from 'viem';
import { verifyMessage } from 'viem';

import { bytesToHex, canonicalize, hexToBytes } from '../utils/index.js';
import type { IdentityKeys, Signer } from './types.js';

// Adapted from the XMTP approach to encrypt keys
// See: https://github.com/xmtp/xmtp-js/blob/8d6e5a65813902926baac8150a648587acbaad92/sdks/js-sdk/src/keystore/providers/NetworkKeyManager.ts#L79-L116
// (We reimplement their encrypt/decrypt functions using noble).

const hkdfDeriveKey = (secret: Uint8Array, salt: Uint8Array): Uint8Array => {
  return hkdf(sha256, secret, salt, '', 32);
};

// This implements the same encryption as  https://github.com/xmtp/xmtp-js/blob/336471de4ea95416ad0f4f9850d3f12bb0a13f1e/sdks/js-sdk/src/encryption/encryption.ts#L18
// But using @noble/ciphers instead of the WebCrypto API.
// The XMTP code was audited by Certik: https://skynet.certik.com/projects/xmtp
//
// Worth noting that GCM nonce collision would break the encryption,
// and 12 bytes is not a lot. So this function should not be used to encrypt
// a large number of messages with the same secret. In our case it should be okay
// as each secret is only used to encrypt a single identity. If we need
// something more secure for a larger number of messages we should use a
// different encryption scheme, e.g. XAES-256-GCM, see https://words.filippo.io/dispatches/xaes-256-gcm/
const encrypt = (msg: Uint8Array, secret: Uint8Array): string => {
  const hkdfSalt = randomBytes(32);
  const gcmNonce = randomBytes(12);
  const derivedKey = hkdfDeriveKey(secret, hkdfSalt);

  const aes = gcm(derivedKey, gcmNonce);

  const ciphertext = aes.encrypt(msg);

  // TODO: Use Effect Schema and better serialization?
  const ciphertextJson = canonicalize({
    aes256GcmHkdfSha256: {
      payload: bytesToHex(ciphertext),
      hkdfSalt: bytesToHex(hkdfSalt),
      gcmNonce: bytesToHex(gcmNonce),
    },
  });
  return bytesToHex(new TextEncoder().encode(ciphertextJson));
};

// This implements the same decryption as  https://github.com/xmtp/xmtp-js/blob/336471de4ea95416ad0f4f9850d3f12bb0a13f1e/sdks/js-sdk/src/encryption/encryption.ts#L41
// But using @noble/ciphers instead of the WebCrypto API
// The XMTP code was audited by Certik: https://skynet.certik.com/projects/xmtp
const decrypt = (ciphertext: string, secret: Uint8Array): Uint8Array => {
  const ciphertextJson = new TextDecoder().decode(hexToBytes(ciphertext));
  const { aes256GcmHkdfSha256 } = JSON.parse(ciphertextJson);
  const hkdfSalt = hexToBytes(aes256GcmHkdfSha256.hkdfSalt);
  const gcmNonce = hexToBytes(aes256GcmHkdfSha256.gcmNonce);
  const derivedKey = hkdfDeriveKey(secret, hkdfSalt);

  const aes = gcm(derivedKey, gcmNonce);

  return aes.decrypt(hexToBytes(aes256GcmHkdfSha256.payload));
};

const signatureMessage = (nonce: Uint8Array): string => {
  return `The Graph: sign to encrypt/decrypt identity keys.\nNonce: ${bytesToHex(nonce)}\n`;
};

export const encryptIdentity = async (
  signer: Signer,
  accountId: string,
  keys: IdentityKeys,
): Promise<{ ciphertext: string; nonce: string }> => {
  const nonce = randomBytes(32);
  const message = signatureMessage(nonce);
  const signature = (await signer.signMessage(message)) as Hex;

  // Check that the signature is valid
  const valid = await verifyMessage({
    address: accountId as Hex,
    message,
    signature,
  });
  if (!valid) {
    throw new Error('Invalid signature');
  }
  const secretKey = hexToBytes(signature);
  // We use a simple plaintext encoding:
  // Hex keys separated by newlines
  const keysTxt = [
    keys.encryptionPublicKey,
    keys.encryptionPrivateKey,
    keys.signaturePublicKey,
    keys.signaturePrivateKey,
  ].join('\n');
  const keysMsg = new TextEncoder().encode(keysTxt);
  const ciphertext = encrypt(keysMsg, secretKey);
  return { ciphertext, nonce: bytesToHex(nonce) };
};

export const decryptIdentity = async (
  signer: Signer,
  accountId: string,
  ciphertext: string,
  nonce: string,
): Promise<IdentityKeys> => {
  const message = signatureMessage(hexToBytes(nonce));
  const signature = (await signer.signMessage(message)) as Hex;

  // Check that the signature is valid
  const valid = await verifyMessage({
    address: accountId as Hex,
    message,
    signature,
  });
  if (!valid) {
    throw new Error('Invalid signature');
  }
  const secretKey = hexToBytes(signature);
  let keysMsg: Uint8Array;
  try {
    keysMsg = await decrypt(ciphertext, secretKey);
  } catch (e) {
    // See https://github.com/xmtp/xmtp-js/blob/8d6e5a65813902926baac8150a648587acbaad92/sdks/js-sdk/src/keystore/providers/NetworkKeyManager.ts#L142-L146
    if (secretKey.length !== 65) {
      throw new Error('Expected 65 bytes before trying a different recovery byte');
    }
    // Try the other version of recovery byte, either +27 or -27
    const lastByte = secretKey[secretKey.length - 1];
    let newSecret = secretKey.slice(0, secretKey.length - 1);
    if (lastByte < 27) {
      newSecret = new Uint8Array([...newSecret, lastByte + 27]);
    } else {
      newSecret = new Uint8Array([...newSecret, lastByte - 27]);
    }
    keysMsg = await decrypt(ciphertext, newSecret);
  }
  const keysTxt = new TextDecoder().decode(keysMsg);
  const [encryptionPublicKey, encryptionPrivateKey, signaturePublicKey, signaturePrivateKey] = keysTxt.split('\n');
  return { encryptionPublicKey, encryptionPrivateKey, signaturePublicKey, signaturePrivateKey };
};
