import { prisma } from '../prisma.js';

type GetParams = {
  sessionToken: string;
};

export const getAppIdentityBySessionToken = async ({ sessionToken }: GetParams) => {
  const account = await prisma.appIdentity.findFirst({
    where: {
      sessionToken,
    },
    select: {
      address: true,
      sessionTokenExpires: true,
      accountAddress: true,
    },
  });
  if (!account) {
    throw new Error('Account not found');
  }
  if (account.sessionTokenExpires && account.sessionTokenExpires < new Date()) {
    throw new Error(`Session token expired for account ${account.address}`);
  }
  return {
    address: account.address,
    accountAddress: account.accountAddress,
  };
};
