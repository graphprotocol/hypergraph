import { prepareAccountInboxMessage, prepareSpaceInboxMessage } from './prepare-message.js';

export async function sendSpaceInboxMessage({
  message,
  spaceId,
  inboxId,
  encryptionPublicKey,
  signaturePrivateKey,
  authorAccountId,
  syncServerUri,
}: Readonly<{
  message: string;
  spaceId: string;
  inboxId: string;
  encryptionPublicKey: string;
  signaturePrivateKey: string | null;
  authorAccountId: string | null;
  syncServerUri: string;
}>) {
  const messageToSend = await prepareSpaceInboxMessage({
    message,
    spaceId,
    inboxId,
    encryptionPublicKey,
    signaturePrivateKey,
    authorAccountId,
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
  accountId,
  inboxId,
  encryptionPublicKey,
  signaturePrivateKey,
  authorAccountId,
  syncServerUri,
}: Readonly<{
  message: string;
  accountId: string;
  inboxId: string;
  encryptionPublicKey: string;
  signaturePrivateKey: string | null;
  authorAccountId: string | null;
  syncServerUri: string;
}>) {
  const messageToSend = await prepareAccountInboxMessage({
    message,
    accountId,
    inboxId,
    encryptionPublicKey,
    signaturePrivateKey,
    authorAccountId,
  });
  const res = await fetch(new URL(`/accounts/${accountId}/inboxes/${inboxId}/messages`, syncServerUri), {
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
