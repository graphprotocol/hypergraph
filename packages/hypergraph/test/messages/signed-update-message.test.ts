import { secp256k1 } from '@noble/curves/secp256k1';
import { randomBytes } from '@noble/hashes/utils';
import { describe, expect, it } from 'vitest';
import { recoverUpdateMessageSigner, signedUpdateMessage } from '../../src/messages/index.js';
import { bytesToHex, hexToBytes } from '../../src/utils/index.js';

describe('sign updates and recover key', () => {
  it('creates a signed message from which you can recover a signing key', () => {
    const accountId = bytesToHex(randomBytes(20));
    const secretKey = bytesToHex(new Uint8Array(32).fill(1));
    const signaturePrivateKeyBytes = secp256k1.utils.randomPrivateKey();
    const signaturePrivateKey = bytesToHex(signaturePrivateKeyBytes);
    const signaturePublicKey = bytesToHex(secp256k1.getPublicKey(signaturePrivateKeyBytes));
    const spaceId = '0x1234';
    const ephemeralId = bytesToHex(randomBytes(32));

    const message = hexToBytes('0x01234abcdef01234');

    const msg = signedUpdateMessage({
      accountId,
      ephemeralId,
      spaceId,
      message,
      secretKey,
      signaturePrivateKey,
    });

    // The signer should be recoverable without needing anything
    // outside of what's included in the message
    const recoveredSigner = recoverUpdateMessageSigner({
      update: msg.update,
      spaceId: msg.spaceId,
      ephemeralId: msg.ephemeralId,
      signature: msg.signature,
      accountId: msg.accountId,
    });

    expect(recoveredSigner).to.eq(signaturePublicKey);
  });
});
