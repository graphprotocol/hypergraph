import type { Messages } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma.js';

type Params = {
  appIdentityAddress: string;
  accountAddress: string;
  spacesInput: Messages.RequestConnectAddAppIdentityToSpaces['spacesInput'];
};

export const addAppIdentityToSpaces = async ({ appIdentityAddress, spacesInput, accountAddress }: Params) => {
  return prisma.$transaction(async (prisma) => {
    const appIdentity = await prisma.appIdentity.update({
      where: {
        address: appIdentityAddress,
        accountAddress,
      },
      data: {
        spaces: {
          connect: spacesInput.map((space) => ({ id: space.id })),
        },
      },
    });

    const keyBoxes = spacesInput.flatMap((entry) => {
      return entry.keyBoxes.map((keyBox) => {
        const keyBoxId = `${keyBox.id}-${appIdentityAddress}`;

        return {
          id: keyBoxId,
          spaceKeyId: keyBox.id,
          ciphertext: keyBox.ciphertext,
          nonce: keyBox.nonce,
          authorPublicKey: keyBox.authorPublicKey,
          accountAddress,
          appIdentityAddress,
        };
      });
    });

    await prisma.spaceKeyBox.createMany({
      data: keyBoxes,
    });

    return appIdentity;
  });
};
