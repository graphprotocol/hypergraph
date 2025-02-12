import type { Inboxes, SpaceEvents } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';

export async function listPublicSpaceInboxes({ spaceId }: { spaceId: string }) {
  const inboxes = await prisma.spaceInbox.findMany({
    where: { spaceId, isPublic: true },
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
  return inboxes.map((inbox) => {
    return {
      inboxId: inbox.id,
      isPublic: inbox.isPublic,
      authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
      encryptionPublicKey: inbox.encryptionPublicKey,
      creationEvent: JSON.parse(inbox.spaceEvent.event) as SpaceEvents.CreateSpaceInboxEvent,
    };
  });
}
