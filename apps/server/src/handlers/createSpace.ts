import type { CreateSpaceEvent } from 'graph-framework-space-events';
import { prisma } from '../prisma.js';

export const createSpace = async (event: CreateSpaceEvent) => {
  return await prisma.spaceEvent.create({
    data: {
      event: JSON.stringify(event),
      id: '1',
      space: {
        create: {
          id: event.transaction.id,
        },
      },
    },
  });
};
