import { prisma } from '../prisma.js';

type Params = {
  accountAddress: string;
  appId: string;
};

export const findAppIdentity = async ({ accountAddress, appId }: Params) => {
  return await prisma.appIdentity.findFirst({
    where: {
      accountAddress,
      appId,
    },
  });
};
