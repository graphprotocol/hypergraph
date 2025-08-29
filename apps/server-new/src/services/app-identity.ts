import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Predicate from 'effect/Predicate';
import {
  InvalidTokenError,
  ResourceAlreadyExistsError,
  ResourceNotFoundError,
  TokenExpiredError,
} from '../http/errors.js';
import * as DatabaseService from './database.js';

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

export class AppIdentityService extends Context.Tag('AppIdentityService')<
  AppIdentityService,
  {
    readonly getBySessionToken: (
      sessionToken: string,
    ) => Effect.Effect<
      { address: string; accountAddress: string },
      InvalidTokenError | DatabaseService.DatabaseError | TokenExpiredError
    >;
    readonly findByAppId: (params: {
      accountAddress: string;
      appId: string;
    }) => Effect.Effect<AppIdentityResult, ResourceNotFoundError | DatabaseService.DatabaseError>;
    readonly createAppIdentity: (
      params: CreateAppIdentityParams,
    ) => Effect.Effect<void, ResourceAlreadyExistsError | DatabaseService.DatabaseError>;
  }
>() {}

export const layer = Effect.gen(function* () {
  const { use } = yield* DatabaseService.DatabaseService;

  const getBySessionToken = Effect.fn('getBySessionToken')(function* (sessionToken: string) {
    const appIdentity = yield* use((client) =>
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
    ).pipe(Effect.filterOrFail(Predicate.isNotNull, () => new InvalidTokenError({ tokenType: 'session' })));

    if (appIdentity.sessionTokenExpires && appIdentity.sessionTokenExpires < new Date()) {
      return yield* new TokenExpiredError({ tokenType: 'session' });
    }

    return {
      address: appIdentity.address,
      accountAddress: appIdentity.accountAddress,
    };
  });

  const findByAppId = Effect.fn('findByAppId')(function* ({
    accountAddress,
    appId,
  }: {
    accountAddress: string;
    appId: string;
  }) {
    const appIdentity = yield* use((client) =>
      client.appIdentity.findFirst({
        where: {
          accountAddress,
          appId,
        },
      }),
    ).pipe(
      Effect.filterOrFail(
        Predicate.isNotNull,
        () =>
          new ResourceNotFoundError({
            resource: 'AppIdentity',
            id: appId,
          }),
      ),
    );

    return appIdentity as AppIdentityResult;
  });

  const createAppIdentity = Effect.fn('createAppIdentity')(function* (params: CreateAppIdentityParams) {
    const appIdentity = yield* use((client) =>
      client.$transaction(async (prisma) => {
        // Check if app identity already exists
        const existingIdentity = await prisma.appIdentity.findFirst({
          where: {
            accountAddress: params.accountAddress,
            appId: params.appId,
          },
        });

        if (existingIdentity) {
          throw new ResourceAlreadyExistsError({
            resource: 'AppIdentity',
            id: params.appId,
          });
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
    );

    return appIdentity;
  });

  return {
    getBySessionToken,
    findByAppId,
    createAppIdentity,
  };
}).pipe(Layer.effect(AppIdentityService), Layer.provide(DatabaseService.layer));
