import type { Messages } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';

type Params = {
  spaceId: string;
  inboxId: string;
  message: Messages.RequestCreateSpaceInboxMessage;
};

export const createSpaceInboxMessage = async (params: Params): Promise<Messages.InboxMessage> => {
  const { spaceId, inboxId, message } = params;
  const spaceInbox = await prisma.spaceInbox.findUnique({
    where: {
      id: inboxId,
    },
  });
  if (!spaceInbox) {
    throw new Error('Space inbox not found');
  }
  if (spaceInbox.spaceId !== spaceId) {
    throw new Error('Incorrect space');
  }
  const createdMessage = await prisma.spaceInboxMessage.create({
    data: {
      spaceInbox: {
        connect: {
          id: spaceInbox.id,
        },
      },
      ciphertext: message.ciphertext,
      signatureHex: message.signature?.hex ?? null,
      signatureRecovery: message.signature?.recovery ?? null,
      authorAccountAddress: message.authorAccountAddress ?? null,
    },
  });
  return {
    id: createdMessage.id,
    ciphertext: createdMessage.ciphertext,
    signature:
      createdMessage.signatureHex != null && createdMessage.signatureRecovery != null
        ? {
            hex: createdMessage.signatureHex,
            recovery: createdMessage.signatureRecovery,
          }
        : undefined,
    authorAccountAddress: createdMessage.authorAccountAddress ?? undefined,
    createdAt: createdMessage.createdAt,
  };
};
