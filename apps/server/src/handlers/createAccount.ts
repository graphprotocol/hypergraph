import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
};

export const createAccount = async ({ accountId }: Params) => {
  return await prisma.account.create({
    data: {
      id: accountId,
    },
  });
};
