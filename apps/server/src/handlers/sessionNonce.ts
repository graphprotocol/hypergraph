import { generateNonce } from 'siwe';
import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
};

export const createSessionNonce = async ({ accountId }: Params) => {
  const nonce = generateNonce();
  await prisma.account.upsert({
    where: {
      id: accountId,
    },
    update: {
      sessionNonce: nonce,
    },
    create: {
      id: accountId,
      sessionNonce: nonce,
    },
  });
  return nonce;
};

export const getSessionNonce = async ({ accountId }: Params) => {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
    },
    select: {
      sessionNonce: true,
    },
  });
  if (!account) {
    throw new Error(`Account not found ${accountId}`);
  }
  if (!account.sessionNonce) {
    throw new Error(`No session nonce for account ${accountId}`);
  }
  return account.sessionNonce;
};
