import type { Inboxes } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';

export async function getAccountInbox({ accountId, inboxId }: { accountId: string; inboxId: string }) {
  const inbox = await prisma.accountInbox.findUnique({
    where: { id: inboxId, accountId },
    select: {
      id: true,
      account: {
        select: {
          id: true,
        },
      },
      isPublic: true,
      authPolicy: true,
      encryptionPublicKey: true,
      signatureHex: true,
      signatureRecovery: true,
    },
  });
  if (!inbox) {
    throw new Error('Inbox not found');
  }

  return {
    inboxId: inbox.id,
    accountId: inbox.account.id,
    isPublic: inbox.isPublic,
    authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
    encryptionPublicKey: inbox.encryptionPublicKey,
    signature: {
      hex: inbox.signatureHex,
      recovery: inbox.signatureRecovery,
    },
  };
}
