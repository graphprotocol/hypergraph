import type { Messages } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';

type Params = {
  accountAddress: string;
  inboxId: string;
  message: Messages.RequestCreateAccountInboxMessage;
};

export const createAccountInboxMessage = async (params: Params): Promise<Messages.InboxMessage> => {
  const { accountAddress, inboxId, message } = params;
  const accountInbox = await prisma.accountInbox.findUnique({
    where: {
      id: inboxId,
      accountAddress,
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
      authorAccountAddress: message.authorAccountAddress ?? null,
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
    authorAccountAddress: createdMessage.authorAccountAddress ?? undefined,
    createdAt: createdMessage.createdAt,
  };
};
