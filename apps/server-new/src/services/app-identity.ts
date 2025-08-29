import { Context, Effect, Layer } from 'effect';
import {
  DatabaseError,
  InvalidTokenError,
  ResourceAlreadyExistsError,
  ResourceNotFoundError,
  TokenExpiredError,
} from '../http/errors.js';
import { DatabaseService } from './database.js';

export interface AppIdentityResult {
  address: string;
  accountAddress: string;
  appId: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  ciphertext: string;
  accountProof: string;
  keyProof: string;
  sessionToken: string | null;
  sessionNonce: string | null;
  sessionTokenExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppIdentityParams {
  accountAddress: string;
  address: string;
  appId: string;
  ciphertext: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
  sessionToken: string;
  sessionTokenExpires: Date;
}

export interface AppIdentityService {
  readonly getBySessionToken: (
    sessionToken: string,
  ) => Effect.Effect<
    { address: string; accountAddress: string },
    InvalidTokenError | ResourceNotFoundError | TokenExpiredError
  >;
  readonly findByAppId: (params: {
    accountAddress: string;
    appId: string;
  }) => Effect.Effect<AppIdentityResult | null, DatabaseError>;
  readonly createAppIdentity: (
    params: CreateAppIdentityParams,
  ) => Effect.Effect<AppIdentityResult, ResourceAlreadyExistsError | DatabaseError>;
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
        return yield* new ResourceNotFoundError({
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

  const findByAppId = ({ accountAddress, appId }: { accountAddress: string; appId: string }) =>
    Effect.fn(function* () {
      const appIdentity = yield* Effect.tryPromise({
        try: () =>
          client.appIdentity.findFirst({
            where: {
              accountAddress,
              appId,
            },
          }),
        catch: (error) =>
          new DatabaseError({
            operation: 'findAppIdentity',
            cause: error,
          }),
      });

      return appIdentity;
    })();

  const createAppIdentity = (params: CreateAppIdentityParams) =>
    Effect.fn(function* () {
      const appIdentity = yield* Effect.tryPromise({
        try: () =>
          client.$transaction(async (prisma) => {
            // Check if app identity already exists
            const existingIdentity = await prisma.appIdentity.findFirst({
              where: {
                accountAddress: params.accountAddress,
                appId: params.appId,
              },
            });

            if (existingIdentity) {
              throw new Error('App identity already exists');
            }

            // Create the new app identity
            return await prisma.appIdentity.create({
              data: {
                address: params.address,
                accountAddress: params.accountAddress,
                appId: params.appId,
                ciphertext: params.ciphertext,
                signaturePublicKey: params.signaturePublicKey,
                encryptionPublicKey: params.encryptionPublicKey,
                accountProof: params.accountProof,
                keyProof: params.keyProof,
                sessionToken: params.sessionToken,
                sessionTokenExpires: params.sessionTokenExpires,
              },
            });
          }),
        catch: (error) => {
          if (error instanceof Error && error.message === 'App identity already exists') {
            return new ResourceAlreadyExistsError({
              resource: 'AppIdentity',
              id: `${params.accountAddress}:${params.appId}`,
            });
          }
          return new DatabaseError({
            operation: 'createAppIdentity',
            cause: error,
          });
        },
      });

      return appIdentity;
    })();

  return {
    getBySessionToken,
    findByAppId,
    createAppIdentity,
  } as const;
})();

export const AppIdentityServiceLive = Layer.effect(AppIdentityService, makeAppIdentityService);
