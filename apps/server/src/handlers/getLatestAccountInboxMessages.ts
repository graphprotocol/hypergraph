import type { Messages } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma.js';

interface GetLatestAccountInboxMessagesParams {
  inboxId: string;
  since: Date;
}

export async function getLatestAccountInboxMessages({
  inboxId,
  since,
}: GetLatestAccountInboxMessagesParams): Promise<Messages.InboxMessage[]> {
  const messages = await prisma.accountInboxMessage.findMany({
    where: {
      accountInboxId: inboxId,
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return messages.map((msg) => ({
    id: msg.id,
    ciphertext: msg.ciphertext,
    signature:
      msg.signatureHex != null && msg.signatureRecovery != null
        ? {
            hex: msg.signatureHex,
            recovery: msg.signatureRecovery,
          }
        : undefined,
    authorAccountId: msg.authorAccountId ?? undefined,
    createdAt: msg.createdAt,
  }));
}
