import { Context, Effect, Layer } from 'effect';
import * as DatabaseService from './database.js';

type CreateUpdateParams = {
  accountAddress: string;
  update: Uint8Array;
  spaceId: string;
  signatureHex: string;
  signatureRecovery: number;
  updateId: string;
};

type CreateUpdateResult = {
  clock: number;
  content: Uint8Array;
  signatureHex: string;
  signatureRecovery: number;
  updateId: string;
  accountAddress: string;
  spaceId: string;
};

export class UpdatesService extends Context.Tag('UpdatesService')<
  UpdatesService,
  {
    readonly createUpdate: (
      params: CreateUpdateParams,
    ) => Effect.Effect<CreateUpdateResult, DatabaseService.DatabaseError>;
  }
>() {}

export const layer = Effect.gen(function* () {
  const { use } = yield* DatabaseService.DatabaseService;

  const createUpdate = Effect.fn('createUpdate')(function* ({
    accountAddress,
    update,
    spaceId,
    signatureHex,
    signatureRecovery,
    updateId,
  }: CreateUpdateParams) {
    // TODO: implement retries
    const result = yield* use((client) => {
      return client.$transaction(async (prisma) => {
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
    });

    return result;
  });

  return {
    createUpdate,
  } as const;
}).pipe(Layer.effect(UpdatesService), Layer.provide(DatabaseService.layer));
