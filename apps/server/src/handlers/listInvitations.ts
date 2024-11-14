import type { SpaceState } from 'graph-framework-space-events';
import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
};

export const listInvitations = async ({ accountId }: Params) => {
  const result = await prisma.invitation.findMany({
    where: {
      accountId,
    },
    include: {
      space: {
        include: {
          events: {
            orderBy: {
              counter: 'asc',
            },
            take: 1,
          },
        },
      },
    },
  });

  return result.map((invitation) => {
    const state = JSON.parse(invitation.space.events[0].state) as SpaceState;
    return {
      id: invitation.id,
      previousEventHash: state.lastEventHash,
      spaceId: invitation.spaceId,
    };
  });
};
