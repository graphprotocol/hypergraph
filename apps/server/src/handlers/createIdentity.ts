import { prisma } from '../prisma.js';

type Params = {
  accountAddress: string;
  ciphertext: string;
  nonce: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
};

export const createIdentity = async ({
  accountAddress,
  ciphertext,
  nonce,
  signaturePublicKey,
  encryptionPublicKey,
  accountProof,
  keyProof,
}: Params) => {
  // TODO: eventually we may support multiple identities
  // for the same account, for now we check there are
  // no other identities for the same accountAddress
  const existingIdentity = await prisma.account.findFirst({
    where: {
      address: accountAddress,
    },
  });
  if (existingIdentity) {
    throw new Error(`Identity already exists for account ${accountAddress}`);
  }
  return await prisma.account.create({
    data: {
      address: accountAddress,
      connectAccountProof: accountProof,
      connectKeyProof: keyProof,
      connectSignaturePublicKey: signaturePublicKey,
      connectEncryptionPublicKey: encryptionPublicKey,
      connectCiphertext: ciphertext,
      connectNonce: nonce,
      connectAddress: accountAddress,
    },
  });
};
