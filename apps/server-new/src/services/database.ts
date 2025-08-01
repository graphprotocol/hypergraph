import { PrismaClient } from '@prisma/client';
import { Context, Effect, Layer } from 'effect';

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
  const client = new PrismaClient();

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
    const client = new PrismaClient();

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
