import { secp256k1 } from '@noble/curves/secp256k1';
import type * as Messages from '../messages/index.js';
import type { SignatureWithRecovery } from '../types.js';
import { canonicalize, hexToBytes, stringToUint8Array } from '../utils/index.js';
import { encryptInboxMessage } from './message-encryption.js';

export async function prepareSpaceInboxMessage({
  message,
  spaceId,
  inboxId,
  encryptionPublicKey,
  signaturePrivateKey,
  authorAccountAddress,
}: Readonly<{
  message: string;
  spaceId: string;
  inboxId: string;
  encryptionPublicKey: string;
  signaturePrivateKey: string | null;
  authorAccountAddress: string | null;
}>) {
  const { ciphertext } = encryptInboxMessage({ message, encryptionPublicKey });
  let signature: SignatureWithRecovery | undefined;
  if (signaturePrivateKey && authorAccountAddress) {
    const messageToSign = stringToUint8Array(
      canonicalize({
        spaceId,
        inboxId,
        ciphertext,
        authorAccountAddress,
      }),
    );
    const signatureInstance = secp256k1.sign(messageToSign, hexToBytes(signaturePrivateKey), { prehash: true });
    signature = {
      hex: signatureInstance.toCompactHex(),
      recovery: signatureInstance.recovery,
    };
  }
  const messageToSend: Messages.RequestCreateSpaceInboxMessage = {
    ciphertext,
    signature,
    authorAccountAddress: authorAccountAddress ?? undefined,
  };
  return messageToSend;
}

export async function prepareAccountInboxMessage({
  message,
  accountAddress,
  inboxId,
  encryptionPublicKey,
  signaturePrivateKey,
  authorAccountAddress,
}: Readonly<{
  message: string;
  accountAddress: string;
  inboxId: string;
  encryptionPublicKey: string;
  signaturePrivateKey: string | null;
  authorAccountAddress: string | null;
}>) {
  const { ciphertext } = encryptInboxMessage({ message, encryptionPublicKey });
  let signature: SignatureWithRecovery | undefined;
  if (signaturePrivateKey && authorAccountAddress) {
    const messageToSign = stringToUint8Array(
      canonicalize({
        accountAddress,
        inboxId,
        ciphertext,
        authorAccountAddress,
      }),
    );
    const signatureInstance = secp256k1.sign(messageToSign, hexToBytes(signaturePrivateKey), { prehash: true });
    signature = {
      hex: signatureInstance.toCompactHex(),
      recovery: signatureInstance.recovery,
    };
  }
  const messageToSend: Messages.RequestCreateAccountInboxMessage = {
    ciphertext,
    signature,
    authorAccountAddress: authorAccountAddress ?? undefined,
  };
  return messageToSend;
}
