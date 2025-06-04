import { prisma } from '../prisma.js';

type Params = {
  appIdentityAddress: string;
};

export const listSpacesByAppIdentity = async ({ appIdentityAddress }: Params) => {
  return await prisma.space.findMany({
    where: {
      appIdentities: {
        some: {
          address: appIdentityAddress,
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
              appIdentityAddress,
            },
          },
        },
      },
    },
  });
};
