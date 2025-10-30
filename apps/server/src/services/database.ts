import { Config, Context, Effect, Layer } from 'effect';
import * as Data from 'effect/Data';
import { PrismaClient } from '../../prisma/generated/client/client';

export class DatabaseError extends Data.TaggedError('DatabaseError')<{
  readonly cause: unknown;
}> {}

/**
 * Database service tag
 */
export class DatabaseService extends Context.Tag('DatabaseService')<
  DatabaseService,
  {
    readonly client: PrismaClient;
    readonly use: <T>(fn: (client: PrismaClient, signal: AbortSignal) => Promise<T>) => Effect.Effect<T, DatabaseError>;
  }
>() {}

/**
 * Database service layer with resource management
 */
export const layer = Layer.scoped(
  DatabaseService,
  Effect.gen(function* () {
    const databaseUrl = yield* Config.string('DATABASE_URL').pipe(Config.withDefault('file:./dev.db'));
    const client = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: async () => {
          const client = new PrismaClient({
            datasourceUrl: databaseUrl,
          });

          await client.$connect();

          return client;
        },
        catch: (cause) => new DatabaseError({ cause }),
      }),
      (client) => Effect.tryPromise(() => client.$disconnect()).pipe(Effect.ignore),
    );

    const use = Effect.fn('databaseUse')(function* <T>(fn: (client: PrismaClient, signal: AbortSignal) => Promise<T>) {
      return yield* Effect.tryPromise({
        try: (signal) => fn(client, signal),
        catch: (cause) => new DatabaseError({ cause }),
      }) as Effect.Effect<T, DatabaseError>;
    });

    return {
      client,
      use,
    };
  }),
);
