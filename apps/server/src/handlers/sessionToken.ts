import { Utils } from '@graphprotocol/hypergraph';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { prisma } from '../prisma.js';

type CreateParams = {
  accountId: string;
  sessionTokenExpires: Date;
};

type GetParams = {
  sessionToken: string;
};

export const createSessionToken = async ({ accountId, sessionTokenExpires }: CreateParams) => {
  const sessionToken = Utils.bytesToHex(randomBytes(32));
  await prisma.account.update({
    where: {
      id: accountId,
    },
    data: {
      sessionToken,
      sessionTokenExpires,
    },
  });
  return sessionToken;
};

export const getAccountIdBySessionToken = async ({ sessionToken }: GetParams) => {
  const account = await prisma.account.findFirst({
    where: {
      sessionToken,
    },
    select: {
      id: true,
      sessionTokenExpires: true,
    },
  });
  if (!account) {
    throw new Error('Account not found');
  }
  if (account.sessionTokenExpires && account.sessionTokenExpires < new Date()) {
    throw new Error(`Session token expired for account ${account.id}`);
  }
  return account.id;
};
