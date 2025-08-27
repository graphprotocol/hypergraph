import { Config, Context, Effect, Layer } from 'effect';
import { PrismaClient } from '../../prisma/generated/client/client';

/**
 * Database service interface
 */
export interface DatabaseService {
  readonly client: PrismaClient;
}

/**
 * Database service tag
 */
export const DatabaseService = Context.GenericTag<DatabaseService>('DatabaseService');

/**
 * Database service implementation
 */
export const makeDatabaseService = Effect.fn(function* () {
  // Get the DATABASE_URL from config
  const databaseUrl = yield* Config.string('DATABASE_URL').pipe(Config.withDefault('file:./dev.db'));

  const client = new PrismaClient({
    datasourceUrl: databaseUrl,
  });

  // Connect to database
  yield* Effect.tryPromise({
    try: () => client.$connect(),
    catch: (error) => new Error(`Failed to connect to database: ${error}`),
  });

  return {
    client,
  } as const;
});

/**
 * Database service layer
 */
export const DatabaseServiceLive = Layer.effect(DatabaseService, makeDatabaseService());

/**
 * Database service layer with resource management
 */
export const DatabaseServiceLiveWithCleanup = Layer.scoped(
  DatabaseService,
  Effect.fn(function* () {
    // Get the DATABASE_URL from config
    const databaseUrl = yield* Config.string('DATABASE_URL').pipe(Config.withDefault('file:./dev.db'));

    const client = new PrismaClient({
      datasourceUrl: databaseUrl,
    });

    // Connect to database
    yield* Effect.tryPromise({
      try: () => client.$connect(),
      catch: (error) => new Error(`Failed to connect to database: ${error}`),
    });

    // Register cleanup
    yield* Effect.addFinalizer(() =>
      Effect.tryPromise({
        try: () => client.$disconnect(),
        catch: (error) => new Error(`Failed to disconnect from database: ${error}`),
      }).pipe(Effect.ignore),
    );

    return {
      client,
    } as const;
  })(),
);
