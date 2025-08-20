import { prisma } from '../prisma.js';

type Params = {
  accountAddress: string;
  address: string;
  appId: string;
  ciphertext: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
  sessionToken: string;
  sessionTokenExpires: Date;
};

export const createAppIdentity = async ({
  accountAddress,
  address,
  appId,
  ciphertext,
  signaturePublicKey,
  encryptionPublicKey,
  accountProof,
  keyProof,
  sessionToken,
  sessionTokenExpires,
}: Params) => {
  return prisma.$transaction(async (prisma) => {
    const existingIdentity = await prisma.appIdentity.findFirst({
      where: {
        accountAddress,
        appId,
      },
    });
    if (existingIdentity) {
      throw new Error('App identity already exists');
    }
    return await prisma.appIdentity.create({
      data: {
        address,
        accountAddress,
        appId,
        ciphertext,
        signaturePublicKey,
        encryptionPublicKey,
        accountProof,
        keyProof,
        sessionToken,
        sessionTokenExpires,
      },
    });
  });
};
