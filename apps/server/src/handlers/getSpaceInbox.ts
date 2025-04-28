import type { Inboxes, SpaceEvents } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';

export async function getSpaceInbox({ spaceId, inboxId }: { spaceId: string; inboxId: string }) {
  const inbox = await prisma.spaceInbox.findUnique({
    where: { id: inboxId, spaceId },
    select: {
      id: true,
      isPublic: true,
      authPolicy: true,
      encryptionPublicKey: true,
      spaceEvent: {
        select: {
          event: true,
        },
      },
    },
  });
  if (!inbox) {
    throw new Error('Inbox not found');
  }

  return {
    inboxId: inbox.id,
    isPublic: inbox.isPublic,
    authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
    encryptionPublicKey: inbox.encryptionPublicKey,
    creationEvent: JSON.parse(inbox.spaceEvent.event) as SpaceEvents.CreateSpaceInboxEvent,
  };
}
