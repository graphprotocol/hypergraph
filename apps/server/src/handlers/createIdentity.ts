import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
  ciphertext: string;
  nonce: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
};

export const createIdentity = async ({
  accountId,
  ciphertext,
  nonce,
  signaturePublicKey,
  encryptionPublicKey,
  accountProof,
  keyProof,
}: Params) => {
  // TODO: eventually we may support multiple identities
  // for the same account, for now we check there are
  // no other identities for the same accountId
  const existingIdentity = await prisma.identity.findFirst({
    where: {
      accountId,
    },
  });
  if (existingIdentity) {
    throw new Error(`Identity already exists for account ${accountId}`);
  }
  return await prisma.identity.create({
    data: {
      accountId,
      ciphertext,
      nonce,
      signaturePublicKey,
      encryptionPublicKey,
      accountProof,
      keyProof,
    },
  });
};
