import { prisma } from '../prisma.js';

type Params = {
  accountAddress: string;
  spaceId: string;
  after?: number;
};

export const listUpdates = async ({ spaceId, accountAddress, after }: Params) => {
  // throw error if account is not a member of the space
  await prisma.space.findUniqueOrThrow({
    where: { id: spaceId, members: { some: { id: accountAddress } } },
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
