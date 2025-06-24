import { prisma } from '../prisma';

export const isSignerForAccount = async (signerAddress: string, accountAddress: string) => {
  const account = await prisma.account.findUnique({
    where: {
      address: accountAddress,
    },
  });
  if (!account) {
    return false;
  }
  return account.connectSignerAddress === signerAddress;
};
