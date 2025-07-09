import { prisma } from '../prisma.js';

type Params = {
  accountAddress: string;
};

export const listSpacesByAccount = async ({ accountAddress }: Params) => {
  return await prisma.space.findMany({
    where: {
      members: {
        some: {
          address: accountAddress,
        },
      },
    },
    include: {
      appIdentities: {
        select: {
          address: true,
          appId: true,
        },
      },
      keys: {
        include: {
          keyBoxes: {
            where: {
              accountAddress,
            },
          },
        },
      },
    },
  });
};
