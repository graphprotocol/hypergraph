import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
};

export const listSpaces = async ({ accountId }: Params) => {
  return await prisma.space.findMany({
    where: {
      members: {
        some: {
          id: accountId,
        },
      },
    },
  });
};
