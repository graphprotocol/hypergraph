import type { CreateSpaceEvent } from 'graph-framework-space-events';
import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
  event: CreateSpaceEvent;
};

export const createSpace = async ({ accountId, event }: Params) => {
  return await prisma.spaceEvent.create({
    data: {
      event: JSON.stringify(event),
      id: event.transaction.id,
      space: {
        create: {
          id: event.transaction.id,
          members: {
            connect: {
              id: accountId,
            },
          },
        },
      },
    },
  });
};
