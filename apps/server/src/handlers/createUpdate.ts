import { prisma } from '../prisma.js';

type Params = {
  accountAddress: string;
  update: Uint8Array;
  spaceId: string;
  signatureHex: string;
  signatureRecovery: number;
  updateId: string;
};

export const createUpdate = async ({
  accountAddress,
  update,
  spaceId,
  signatureHex,
  signatureRecovery,
  updateId,
}: Params) => {
  // throw error if account is not a member of the space
  await prisma.space.findUniqueOrThrow({
    where: { id: spaceId, members: { some: { address: accountAddress } } },
  });

  let success = false;
  let retries = 0;
  const maxRetries = 5;
  const retryDelay = 100; // milliseconds
  let result:
    | {
        spaceId: string;
        clock: number;
        content: Buffer;
      }
    | undefined;

  while (!success && retries < maxRetries) {
    try {
      result = await prisma.$transaction(async (prisma) => {
        const lastUpdate = await prisma.update.findFirst({
          where: { spaceId },
          orderBy: { clock: 'desc' },
        });

        const clock = lastUpdate ? lastUpdate.clock + 1 : 0;

        return await prisma.update.create({
          data: {
            space: { connect: { id: spaceId } },
            clock,
            content: Buffer.from(update),
            signatureHex,
            signatureRecovery,
            updateId,
            account: { connect: { address: accountAddress } },
          },
        });
      });
      success = true;
    } catch (error) {
      const dbError = error as { code?: string; message?: string };
      if (dbError.code === 'P2034' || dbError.code === 'P1008' || dbError.message?.includes('database is locked')) {
        retries += 1;
        console.warn(`Database is busy, retrying (${retries}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error('Database error:', error);
        break;
      }
    }
  }

  if (!result) {
    throw new Error('Failed to create update');
  }

  return result;
};
