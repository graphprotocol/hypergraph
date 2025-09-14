import { Context, Effect, Layer } from 'effect';
import * as Predicate from 'effect/Predicate';
import { ResourceNotFoundError } from '../http/errors.js';
import * as DatabaseService from './database.js';

export interface IdentityResult {
  accountAddress: string;
  ciphertext: string;
  nonce?: string | undefined;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
  appId: string | null;
}

export class IdentityService extends Context.Tag('IdentityService')<
  IdentityService,
  {
    readonly getAppOrConnectIdentity: (
      params: { accountAddress: string; signaturePublicKey: string } | { accountAddress: string; appId: string },
    ) => Effect.Effect<IdentityResult, ResourceNotFoundError | DatabaseService.DatabaseError>;
  }
>() {}

export const layer = Effect.gen(function* () {
  const { use } = yield* DatabaseService.DatabaseService;

  const getAppOrConnectIdentity = Effect.fn('getAppOrConnectIdentity')(function* (
    params: { accountAddress: string; signaturePublicKey: string } | { accountAddress: string; appId: string },
  ) {
    // If we have signaturePublicKey, search by that
    if ('signaturePublicKey' in params) {
      // First try to find Connect identity
      const account = yield* use((client) =>
        client.account.findFirst({
          where: {
            address: params.accountAddress,
            connectSignaturePublicKey: params.signaturePublicKey,
          },
        }),
      );

      if (account !== null) {
        return {
          accountAddress: account.address,
          ciphertext: account.connectCiphertext,
          nonce: account.connectNonce,
          signaturePublicKey: account.connectSignaturePublicKey,
          encryptionPublicKey: account.connectEncryptionPublicKey,
          accountProof: account.connectAccountProof,
          keyProof: account.connectKeyProof,
          appId: null,
        };
      }

      // If we don't have a Connect identity, try to find an App identity
      const appIdentity = yield* use((client) =>
        client.appIdentity.findFirst({
          where: {
            accountAddress: params.accountAddress,
            signaturePublicKey: params.signaturePublicKey,
          },
        }),
      ).pipe(
        Effect.filterOrFail(
          Predicate.isNotNull,
          () =>
            new ResourceNotFoundError({
              resource: 'Identity',
              id: params.accountAddress,
            }),
        ),
      );

      return {
        accountAddress: appIdentity.accountAddress,
        ciphertext: appIdentity.ciphertext,
        nonce: undefined,
        signaturePublicKey: appIdentity.signaturePublicKey,
        encryptionPublicKey: appIdentity.encryptionPublicKey,
        accountProof: appIdentity.accountProof,
        keyProof: appIdentity.keyProof,
        appId: appIdentity.appId,
      };
    }

    // If we have appId, search by that
    const appIdentity = yield* use((client) =>
      client.appIdentity.findFirst({
        where: {
          accountAddress: params.accountAddress,
          appId: params.appId,
        },
      }),
    ).pipe(
      Effect.filterOrFail(
        Predicate.isNotNull,
        () =>
          new ResourceNotFoundError({
            resource: 'Identity',
            id: params.accountAddress,
          }),
      ),
    );

    return {
      accountAddress: appIdentity.accountAddress,
      ciphertext: appIdentity.ciphertext,
      nonce: undefined,
      signaturePublicKey: appIdentity.signaturePublicKey,
      encryptionPublicKey: appIdentity.encryptionPublicKey,
      accountProof: appIdentity.accountProof,
      keyProof: appIdentity.keyProof,
      appId: appIdentity.appId,
    };
  });

  return {
    getAppOrConnectIdentity,
  } as const;
}).pipe(Layer.effect(IdentityService), Layer.provide(DatabaseService.layer));
