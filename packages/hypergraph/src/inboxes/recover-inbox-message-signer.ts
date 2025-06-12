import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import type * as Messages from '../messages/index.js';
import * as Utils from '../utils/index.js';

export const recoverSpaceInboxMessageSigner = (
  message: Messages.RequestCreateSpaceInboxMessage,
  spaceId: string,
  inboxId: string,
) => {
  if (!message.signature) {
    throw new Error('Signature is required');
  }
  let signatureInstance = secp256k1.Signature.fromCompact(message.signature.hex);
  signatureInstance = signatureInstance.addRecoveryBit(message.signature.recovery);
  const signedMessage = {
    spaceId,
    inboxId,
    ciphertext: message.ciphertext,
    authorAccountAddress: message.authorAccountAddress,
  };
  return `0x${signatureInstance.recoverPublicKey(sha256(Utils.stringToUint8Array(Utils.canonicalize(signedMessage)))).toHex()}`;
};

export const recoverAccountInboxMessageSigner = (
  message: Messages.RequestCreateAccountInboxMessage,
  accountAddress: string,
  inboxId: string,
) => {
  if (!message.signature) {
    throw new Error('Signature is required');
  }
  let signatureInstance = secp256k1.Signature.fromCompact(message.signature.hex);
  signatureInstance = signatureInstance.addRecoveryBit(message.signature.recovery);
  const signedMessage = {
    accountAddress,
    inboxId,
    ciphertext: message.ciphertext,
    authorAccountAddress: message.authorAccountAddress,
  };
  return `0x${signatureInstance.recoverPublicKey(sha256(Utils.stringToUint8Array(Utils.canonicalize(signedMessage)))).toHex()}`;
};
