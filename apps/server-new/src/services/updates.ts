import { Context, Effect, Layer, Predicate, Schedule } from 'effect';
import { ResourceNotFoundError } from '../http/errors.js';
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
    ) => Effect.Effect<CreateUpdateResult, DatabaseService.DatabaseError | ResourceNotFoundError, never>;
  }
>() {}

// Retry with Effect's built-in retry mechanism for database lock errors
const retrySchedule = Schedule.exponential('100 millis').pipe(
  Schedule.intersect(Schedule.recurs(5)),
  Schedule.whileInput((error: DatabaseService.DatabaseError) => {
    // Check if it's a database lock error that should trigger retry
    const cause = error.cause as { code?: string; message?: string };
    const shouldRetry =
      cause?.code === 'P2034' || // Prisma transaction conflict
      cause?.code === 'P1008' || // Prisma connection timeout
      Boolean(cause?.message?.includes('database is locked'));
    return shouldRetry;
  }),
);

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
    // First verify the account is a member of the space
    yield* use((client) =>
      client.space.findUnique({
        where: { id: spaceId, members: { some: { address: accountAddress } } },
      }),
    ).pipe(
      Effect.filterOrFail(Predicate.isNotNull, () => new ResourceNotFoundError({ resource: 'Space', id: spaceId })),
    );

    const result = yield* use((client) =>
      client.$transaction(async (prisma) => {
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
      }),
    ).pipe(
      Effect.retry(retrySchedule),
      Effect.tapError((error) => {
        const cause = error.cause as { code?: string; message?: string };
        return Effect.logError('Failed to create update after retries', {
          error: cause?.message || String(error),
          code: cause?.code,
          spaceId,
          updateId,
        });
      }),
    );

    return {
      clock: result.clock,
      content: new Uint8Array(result.content),
      signatureHex: result.signatureHex,
      signatureRecovery: result.signatureRecovery,
      updateId: result.updateId,
      accountAddress: result.accountAddress,
      spaceId: result.spaceId,
    };
  });

  return {
    createUpdate,
  } as const;
}).pipe(Layer.effect(UpdatesService), Layer.provide(DatabaseService.layer));
