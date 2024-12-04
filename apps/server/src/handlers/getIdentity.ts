import { prisma } from '../prisma.js';

type Params = {
  accountId?: string;
  signaturePublicKey?: string;
};

export const getIdentity = async (params: Params) => {
  if (!params.accountId && !params.signaturePublicKey) {
    throw new Error('Either accountId or signaturePublicKey must be provided');
  }
  const identity = await prisma.identity.findFirst({
    where: params,
  });
  if (!identity) {
    throw new Error(`Identity not found for account ${params.accountId}`);
  }
  return identity;
};
