import { prisma } from '../prisma.js';

type Params =
  | {
      accountAddress: string;
      signaturePublicKey: string;
      spaceId?: string;
    }
  | {
      accountAddress: string;
      appId: string;
      spaceId?: string;
    };

export type GetIdentityResult = {
  accountAddress: string;
  ciphertext: string;
  nonce: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
  appId: string | null;
};

export const getAppOrConnectIdentity = async (params: Params): Promise<GetIdentityResult> => {
  if (!('appId' in params)) {
    const where: { address: string; connectSignaturePublicKey?: string } = { address: params.accountAddress };
    if ('signaturePublicKey' in params) {
      where.connectSignaturePublicKey = params.signaturePublicKey;
    }
    const account = await prisma.account.findFirst({
      where,
    });
    if (account) {
      return {
        accountAddress: account.address,
        ciphertext: account.connectCiphertext,
        nonce: account.connectNonce,
        signaturePublicKey: account.connectSignaturePublicKey,
        encryptionPublicKey: account.connectEncryptionPublicKey,
        accountProof: account.connectAccountProof,
        keyProof: account.connectKeyProof,
        appId: null,
      };
    }
  }
  const appWhere: {
    accountAddress: string;
    appId?: string;
    signaturePublicKey?: string;
    spaces?: { some: { id: string } };
  } = {
    accountAddress: params.accountAddress,
  };
  if ('signaturePublicKey' in params) {
    appWhere.signaturePublicKey = params.signaturePublicKey;
  }
  if ('appId' in params) {
    appWhere.appId = params.appId;
  }
  if (params.spaceId) {
    appWhere.spaces = { some: { id: params.spaceId } };
  }

  const appIdentity = await prisma.appIdentity.findFirst({
    where: appWhere,
  });
  if (appIdentity) {
    return {
      accountAddress: appIdentity.accountAddress,
      ciphertext: appIdentity.ciphertext,
      nonce: appIdentity.nonce,
      signaturePublicKey: appIdentity.signaturePublicKey,
      encryptionPublicKey: appIdentity.encryptionPublicKey,
      accountProof: appIdentity.accountProof,
      keyProof: appIdentity.keyProof,
      appId: appIdentity.appId,
    };
  }
  throw new Error('Identity not found');
};
