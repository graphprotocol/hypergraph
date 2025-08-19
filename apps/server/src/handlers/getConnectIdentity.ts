import { prisma } from '../prisma.js';

type Params =
  | {
      accountAddress: string;
      connectSignaturePublicKey?: string;
    }
  | {
      accountAddress?: string;
      connectSignaturePublicKey: string;
    };

export type GetConnectIdentityResult = {
  accountAddress: string;
  ciphertext: string;
  nonce: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
};

export const getConnectIdentity = async (params: Params): Promise<GetConnectIdentityResult> => {
  if (!params.accountAddress && !params.connectSignaturePublicKey) {
    throw new Error('Either accountAddress or connectSignaturePublicKey must be provided');
  }
  const where = params.accountAddress ? { address: params.accountAddress } : params;
  const account = await prisma.account.findFirst({
    where,
  });
  if (!account) {
    throw new Error(`Identity not found for account ${params.accountAddress ?? params.connectSignaturePublicKey}`);
  }
  return {
    accountAddress: account.address,
    ciphertext: account.connectCiphertext,
    nonce: account.connectNonce,
    signaturePublicKey: account.connectSignaturePublicKey,
    encryptionPublicKey: account.connectEncryptionPublicKey,
    accountProof: account.connectAccountProof,
    keyProof: account.connectKeyProof,
  };
};
