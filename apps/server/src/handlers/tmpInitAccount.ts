import { prisma } from '../prisma.js';

export const tmpInitAccount = async (accountId: string) => {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (account === null) {
    await prisma.account.create({ data: { id: accountId } });
  }
};
