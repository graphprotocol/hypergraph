import { prisma } from '../prisma.js';

type Params = {
  spaceId: string;
  accountId: string;
};

export const getSpace = async ({ spaceId, accountId }: Params) => {
  const space = await prisma.space.findUniqueOrThrow({
    where: {
      id: spaceId,
      members: {
        some: {
          id: accountId,
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
              accountId,
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
    },
  });

  const keyBoxes = space.keys.flatMap((key) => {
    return {
      id: key.id,
      nonce: key.keyBoxes[0].nonce,
      ciphertext: key.keyBoxes[0].ciphertext,
      accountId,
      authorPublicKey: key.keyBoxes[0].authorPublicKey,
    };
  });

  const formatUpdate = (update) => {
    return {
      accountId: update.accountId,
      update: new Uint8Array(update.content),
      signature: {
        hex: update.signatureHex,
        recovery: update.signatureRecovery,
      },
      updateId: update.updateId,
    };
  };

  return {
    id: space.id,
    events: space.events.map((wrapper) => JSON.parse(wrapper.event)),
    keyBoxes,
    updates:
      space.updates.length > 0
        ? {
            updates: space.updates.map(formatUpdate),
            firstUpdateClock: space.updates[0].clock,
            lastUpdateClock: space.updates[space.updates.length - 1].clock,
          }
        : undefined,
  };
};
