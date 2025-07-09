import type { Inboxes } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma.js';

type Params = {
  spaceId: string;
  accountAddress: string;
};

export const getSpace = async ({ spaceId, accountAddress }: Params) => {
  const space = await prisma.space.findUniqueOrThrow({
    where: {
      id: spaceId,
      members: {
        some: {
          address: accountAddress,
        },
      },
    },
    include: {
      events: {
        orderBy: {
          counter: 'asc',
        },
      },
      keys: {
        include: {
          keyBoxes: {
            where: {
              accountAddress,
            },
            select: {
              nonce: true,
              ciphertext: true,
              authorPublicKey: true,
            },
          },
        },
      },
      updates: {
        orderBy: {
          clock: 'asc',
        },
      },
      inboxes: {
        select: {
          id: true,
          isPublic: true,
          authPolicy: true,
          encryptionPublicKey: true,
          encryptedSecretKey: true,
        },
      },
    },
  });

  const keyBoxes = space.keys.flatMap((key) => {
    return {
      id: key.id,
      nonce: key.keyBoxes[0].nonce,
      ciphertext: key.keyBoxes[0].ciphertext,
      accountAddress,
      authorPublicKey: key.keyBoxes[0].authorPublicKey,
    };
  });

  return {
    id: space.id,
    name: space.name,
    events: space.events.map((wrapper) => JSON.parse(wrapper.event)),
    keyBoxes,
    inboxes: space.inboxes.map((inbox) => ({
      inboxId: inbox.id,
      isPublic: inbox.isPublic,
      authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
      encryptionPublicKey: inbox.encryptionPublicKey,
      secretKey: inbox.encryptedSecretKey,
    })),
    updates:
      space.updates.length > 0
        ? {
            updates: space.updates.map((update) => ({
              accountAddress: update.accountAddress,
              update: new Uint8Array(update.content),
              signature: {
                hex: update.signatureHex,
                recovery: update.signatureRecovery,
              },
              updateId: update.updateId,
            })),
            firstUpdateClock: space.updates[0].clock,
            lastUpdateClock: space.updates[space.updates.length - 1].clock,
          }
        : undefined,
  };
};
