import type { Messages } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma.js';

interface GetLatestSpaceInboxMessagesParams {
  inboxId: string;
  since: Date;
}

export async function getLatestSpaceInboxMessages({
  inboxId,
  since,
}: GetLatestSpaceInboxMessagesParams): Promise<Messages.InboxMessage[]> {
  const messages = await prisma.spaceInboxMessage.findMany({
    where: {
      spaceInboxId: inboxId,
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
