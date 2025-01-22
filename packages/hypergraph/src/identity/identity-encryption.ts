import { randomBytes } from '@noble/ciphers/webcrypto';
import { Ciphertext, decrypt, encrypt } from '@xmtp/xmtp-js';
import type { Hex } from 'viem';
import { verifyMessage } from 'viem';

import { bytesToHex, hexToBytes } from '../utils/index.js';
import type { IdentityKeys, Signer } from './types.js';

// Adapted from the XMTP approach to encrypt keys
// See: https://github.com/xmtp/xmtp-js/blob/8d6e5a65813902926baac8150a648587acbaad92/sdks/js-sdk/src/keystore/providers/NetworkKeyManager.ts#L79-L116
// (We use their encrypt/decrypt functions, safer than re-implementing them).

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
  const ciphertext = bytesToHex((await encrypt(keysMsg, secretKey)).toBytes());
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
  const ciphertextObj = Ciphertext.fromBytes(hexToBytes(ciphertext));
  try {
    keysMsg = await decrypt(ciphertextObj, secretKey);
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
    keysMsg = await decrypt(ciphertextObj, newSecret);
  }
  const keysTxt = new TextDecoder().decode(keysMsg);
  const [encryptionPublicKey, encryptionPrivateKey, signaturePublicKey, signaturePrivateKey] = keysTxt.split('\n');
  return { encryptionPublicKey, encryptionPrivateKey, signaturePublicKey, signaturePrivateKey };
};
