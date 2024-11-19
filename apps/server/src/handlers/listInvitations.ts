import { Schema } from 'effect';
import { SpaceState } from 'graph-framework-space-events';
import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
};

const decodeSpaceState = Schema.decodeUnknownEither(SpaceState);

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
              counter: 'desc',
            },
            take: 1,
          },
        },
      },
    },
  });

  return result
    .map((invitation) => {
      const result = decodeSpaceState(JSON.parse(invitation.space.events[0].state));
      if (result._tag === 'Right') {
        const state = result.right;
        return {
          id: invitation.id,
          previousEventHash: state.lastEventHash,
          spaceId: invitation.spaceId,
        };
      }
      console.error('Invalid space state from the DB', result.left);
      return null;
    })
    .filter((invitation) => invitation !== null);
};
