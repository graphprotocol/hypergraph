import { Effect, Exit } from 'effect';
import { type CreateSpaceEvent, applyEvent } from 'graph-framework-space-events';
import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
  event: CreateSpaceEvent;
};

export const createSpace = async ({ accountId, event }: Params) => {
  const result = await Effect.runPromiseExit(applyEvent({ event }));
  if (Exit.isFailure(result)) {
    throw new Error('Invalid event');
  }

  return await prisma.spaceEvent.create({
    data: {
      event: JSON.stringify(event),
      id: event.transaction.id,
      counter: 0,
      state: JSON.stringify(result.value),
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
