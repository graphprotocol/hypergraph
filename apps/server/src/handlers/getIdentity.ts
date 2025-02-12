import { prisma } from '../prisma.js';

type Params =
  | {
      accountId: string;
      signaturePublicKey?: string;
    }
  | {
      accountId?: string;
      signaturePublicKey: string;
    };

export type GetIdentityResult = {
  accountId: string;
  ciphertext: string;
  nonce: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
};

export const getIdentity = async (params: Params): Promise<GetIdentityResult> => {
  if (!params.accountId && !params.signaturePublicKey) {
    throw new Error('Either accountId or signaturePublicKey must be provided');
  }
  const identity = await prisma.identity.findFirst({
    where: params,
  });
  if (!identity) {
    throw new Error(`Identity not found for account ${params.accountId ?? params.signaturePublicKey}`);
  }
  return identity;
};
