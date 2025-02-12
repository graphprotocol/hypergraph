import type { Inboxes } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';

export async function listPublicAccountInboxes({ accountId }: { accountId: string }) {
  const inboxes = await prisma.accountInbox.findMany({
    where: { accountId, isPublic: true },
    select: {
      id: true,
      isPublic: true,
      authPolicy: true,
      encryptionPublicKey: true,
      account: {
        select: {
          id: true,
        },
      },
      signatureHex: true,
      signatureRecovery: true,
    },
  });
  return inboxes.map((inbox) => {
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
  });
}
