import { prisma } from '../prisma.js';

type Params = {
  spaceId: string;
  accountId: string;
};

export const getSpace = async ({ spaceId, accountId }: Params) => {
  return await prisma.space.findUniqueOrThrow({
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
    },
  });
};
