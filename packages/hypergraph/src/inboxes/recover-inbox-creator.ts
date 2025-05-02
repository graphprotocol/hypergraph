import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import type { AccountInbox } from '../messages/index.js';
import type { CreateSpaceInboxEvent } from '../space-events/index.js';
import { stringToUint8Array } from '../utils/index.js';
import { canonicalize } from '../utils/index.js';

export const recoverAccountInboxCreatorKey = (inbox: AccountInbox): string => {
  const messageToVerify = stringToUint8Array(
    canonicalize({
      accountId: inbox.accountId,
      inboxId: inbox.inboxId,
      encryptionPublicKey: inbox.encryptionPublicKey,
    }),
  );
  const signature = inbox.signature;
  let signatureInstance = secp256k1.Signature.fromCompact(signature.hex);
  signatureInstance = signatureInstance.addRecoveryBit(signature.recovery);
  const authorPublicKey = `0x${signatureInstance.recoverPublicKey(sha256(messageToVerify)).toHex()}`;
  return authorPublicKey;
};

export const recoverSpaceInboxCreatorKey = (event: CreateSpaceInboxEvent): string => {
  const messageToVerify = stringToUint8Array(canonicalize(event.transaction));
  const signature = event.author.signature;
  let signatureInstance = secp256k1.Signature.fromCompact(signature.hex);
  signatureInstance = signatureInstance.addRecoveryBit(signature.recovery);
  const authorPublicKey = `0x${signatureInstance.recoverPublicKey(sha256(messageToVerify)).toHex()}`;
  return authorPublicKey;
};
