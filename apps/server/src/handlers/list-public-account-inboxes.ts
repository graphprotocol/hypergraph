import type { Inboxes } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';

export async function listPublicAccountInboxes({ accountAddress }: { accountAddress: string }) {
  const inboxes = await prisma.accountInbox.findMany({
    where: { accountAddress, isPublic: true },
    select: {
      id: true,
      isPublic: true,
      authPolicy: true,
      encryptionPublicKey: true,
      account: {
        select: {
          address: true,
        },
      },
      signatureHex: true,
      signatureRecovery: true,
    },
  });
  return inboxes.map((inbox) => {
    return {
      inboxId: inbox.id,
      accountAddress: inbox.account.address,
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
