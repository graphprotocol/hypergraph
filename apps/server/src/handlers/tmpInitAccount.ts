import { Identity } from '@graphprotocol/hypergraph';
import type { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { prisma } from '../prisma.js';

export const tmpInitAccount = async ({
  accountId,
  walletPrivateKey,
  sessionToken,
  signaturePublicKey,
  signaturePrivateKey,
  encryptionPublicKey,
}: {
  accountId: string;
  walletPrivateKey: string;
  sessionToken: string;
  signaturePublicKey: string;
  signaturePrivateKey: string;
  encryptionPublicKey: string;
}) => {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (account === null) {
    console.log('Creating test account with id: ', accountId);
    await prisma.account.create({
      data: { id: accountId, sessionToken, sessionTokenExpires: new Date(Date.now() + 1000 * 3600 * 24 * 365 * 1000) },
    }); // 1000 years should be enough

    const wallet = privateKeyToAccount(walletPrivateKey as Hex);

    const { accountProof, keyProof } = await Identity.proveIdentityOwnership(
      {
        signMessage: async (message: string) => wallet.signMessage({ message }),
        getAddress: async () => wallet.address,
      },
      accountId,
      {
        signaturePublicKey: signaturePublicKey,
        signaturePrivateKey: signaturePrivateKey,
        encryptionPublicKey: encryptionPublicKey,
        encryptionPrivateKey: '0x',
      },
    );
    await prisma.identity.create({
      data: {
        accountId,
        ciphertext: '0xabcd',
        nonce: '0xabcd',
        signaturePublicKey,
        encryptionPublicKey,
        accountProof,
        keyProof,
      },
    });
  }
};
