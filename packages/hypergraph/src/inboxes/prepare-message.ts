import type { Messages } from '@graphprotocol/hypergraph';
import { secp256k1 } from '@noble/curves/secp256k1';
import type { SignatureWithRecovery } from '../types.js';
import { canonicalize, hexToBytes, stringToUint8Array } from '../utils/index.js';
import { encryptInboxMessage } from './message-encryption.js';

export async function prepareSpaceInboxMessage({
  message,
  spaceId,
  inboxId,
  encryptionPublicKey,
  signaturePrivateKey,
  authorAccountId,
}: Readonly<{
  message: string;
  spaceId: string;
  inboxId: string;
  encryptionPublicKey: string;
  signaturePrivateKey: string | null;
  authorAccountId: string | null;
}>) {
  const { ciphertext } = encryptInboxMessage({ message, encryptionPublicKey });
  let signature: SignatureWithRecovery | undefined;
  if (signaturePrivateKey && authorAccountId) {
    const messageToSign = stringToUint8Array(
      canonicalize({
        spaceId,
        inboxId,
        ciphertext,
        authorAccountId,
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
    authorAccountId: authorAccountId ?? undefined,
  };
  return messageToSend;
}

export async function prepareAccountInboxMessage({
  message,
  accountId,
  inboxId,
  encryptionPublicKey,
  signaturePrivateKey,
  authorAccountId,
}: Readonly<{
  message: string;
  accountId: string;
  inboxId: string;
  encryptionPublicKey: string;
  signaturePrivateKey: string | null;
  authorAccountId: string | null;
}>) {
  const { ciphertext } = encryptInboxMessage({ message, encryptionPublicKey });
  let signature: SignatureWithRecovery | undefined;
  if (signaturePrivateKey && authorAccountId) {
    const messageToSign = stringToUint8Array(
      canonicalize({
        accountId,
        inboxId,
        ciphertext,
        authorAccountId,
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
    authorAccountId: authorAccountId ?? undefined,
  };
  return messageToSend;
}
