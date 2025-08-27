import { Context, Effect, Layer } from 'effect';
import { InvalidTokenError, ResourceNotFoundError, TokenExpiredError } from '../http/errors.js';
import { DatabaseService } from './database.js';

export interface AppIdentityService {
  readonly getBySessionToken: (
    sessionToken: string,
  ) => Effect.Effect<
    { address: string; accountAddress: string },
    InvalidTokenError | ResourceNotFoundError | TokenExpiredError
  >;
}

export const AppIdentityService = Context.GenericTag<AppIdentityService>('AppIdentityService');

export const makeAppIdentityService = Effect.fn(function* () {
  const { client } = yield* DatabaseService;

  const getBySessionToken = (sessionToken: string) =>
    Effect.fn(function* () {
      const appIdentity = yield* Effect.tryPromise({
        try: () =>
          client.appIdentity.findFirst({
            where: {
              sessionToken,
            },
            select: {
              address: true,
              sessionTokenExpires: true,
              accountAddress: true,
            },
          }),
        catch: () => new InvalidTokenError({ tokenType: 'session' }),
      });

      if (!appIdentity) {
        yield* new ResourceNotFoundError({
          resource: 'AppIdentity',
          id: 'session-token',
        });
      }

      if (appIdentity.sessionTokenExpires && appIdentity.sessionTokenExpires < new Date()) {
        yield* new TokenExpiredError({ tokenType: 'session' });
      }

      return {
        address: appIdentity.address,
        accountAddress: appIdentity.accountAddress,
      };
    })();

  return {
    getBySessionToken,
  } as const;
})();

export const AppIdentityServiceLive = Layer.effect(AppIdentityService, makeAppIdentityService);
