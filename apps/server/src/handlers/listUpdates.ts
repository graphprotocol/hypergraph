import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
  spaceId: string;
  after?: number;
};

export const listUpdates = async ({ spaceId, accountId, after }: Params) => {
  // throw error if account is not a member of the space
  await prisma.space.findUniqueOrThrow({
    where: { id: spaceId, members: { some: { id: accountId } } },
  });

  return await prisma.update.findMany({
    where: after
      ? {
          spaceId,
          clock: { gt: after },
        }
      : { spaceId },
    orderBy: {
      clock: 'desc',
    },
  });
};
