import { prepareAccountInboxMessage, prepareSpaceInboxMessage } from './prepare-message.js';

export async function sendSpaceInboxMessage({
  message,
  spaceId,
  inboxId,
  encryptionPublicKey,
  signaturePrivateKey,
  authorAccountAddress,
  syncServerUri,
}: Readonly<{
  message: string;
  spaceId: string;
  inboxId: string;
  encryptionPublicKey: string;
  signaturePrivateKey: string | null;
  authorAccountAddress: string | null;
  syncServerUri: string;
}>) {
  const messageToSend = await prepareSpaceInboxMessage({
    message,
    spaceId,
    inboxId,
    encryptionPublicKey,
    signaturePrivateKey,
    authorAccountAddress,
  });
  const res = await fetch(new URL(`/spaces/${spaceId}/inboxes/${inboxId}/messages`, syncServerUri), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageToSend),
  });
  if (!res.ok) {
    throw new Error('Failed to send message');
  }
}

export async function sendAccountInboxMessage({
  message,
  accountAddress,
  inboxId,
  encryptionPublicKey,
  signaturePrivateKey,
  authorAccountAddress,
  syncServerUri,
}: Readonly<{
  message: string;
  accountAddress: string;
  inboxId: string;
  encryptionPublicKey: string;
  signaturePrivateKey: string | null;
  authorAccountAddress: string | null;
  syncServerUri: string;
}>) {
  const messageToSend = await prepareAccountInboxMessage({
    message,
    accountAddress,
    inboxId,
    encryptionPublicKey,
    signaturePrivateKey,
    authorAccountAddress,
  });
  const res = await fetch(new URL(`/accounts/${accountAddress}/inboxes/${inboxId}/messages`, syncServerUri), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageToSend),
  });
  if (!res.ok) {
    throw new Error('Failed to send message');
  }
}
