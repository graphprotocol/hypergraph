import type { Messages } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';

type Params = {
  accountId: string;
  inboxId: string;
  message: Messages.RequestCreateAccountInboxMessage;
};

export const createAccountInboxMessage = async (params: Params): Promise<Messages.InboxMessage> => {
  const { accountId, inboxId, message } = params;
  const accountInbox = await prisma.accountInbox.findUnique({
    where: {
      id: inboxId,
      accountId,
    },
  });
  if (!accountInbox) {
    throw new Error('Account inbox not found');
  }

  const createdMessage = await prisma.accountInboxMessage.create({
    data: {
      ciphertext: message.ciphertext,
      signatureHex: message.signature?.hex ?? null,
      signatureRecovery: message.signature?.recovery ?? null,
      authorAccountId: message.authorAccountId ?? null,
      accountInbox: {
        connect: {
          id: accountInbox.id,
        },
      },
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
    authorAccountId: createdMessage.authorAccountId ?? undefined,
    createdAt: createdMessage.createdAt,
  };
};
