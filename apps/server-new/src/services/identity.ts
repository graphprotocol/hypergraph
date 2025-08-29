import { Context, Effect, Layer } from 'effect';
import { ResourceNotFoundError } from '../http/errors.js';
import { DatabaseService } from './database.js';

export interface IdentityResult {
  accountAddress: string;
  ciphertext: string;
  nonce?: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
  appId: string | null;
}

export interface IdentityService {
  readonly getAppOrConnectIdentity: (params:
    | { accountAddress: string; signaturePublicKey: string }
    | { accountAddress: string; appId: string }
  ) => Effect.Effect<IdentityResult, ResourceNotFoundError>;
}

export const IdentityService = Context.GenericTag<IdentityService>('IdentityService');

export const makeIdentityService = Effect.fn(function* () {
  const { client } = yield* DatabaseService;

  const getAppOrConnectIdentity = (params:
    | { accountAddress: string; signaturePublicKey: string }
    | { accountAddress: string; appId: string }
  ) =>
    Effect.fn(function* () {
      // If we have signaturePublicKey, search by that
      if ('signaturePublicKey' in params) {
        // First try to find Connect identity
        const account = yield* Effect.tryPromise({
          try: () =>
            client.account.findFirst({
              where: {
                address: params.accountAddress,
                connectSignaturePublicKey: params.signaturePublicKey,
              },
            }),
          catch: () =>
            new ResourceNotFoundError({
              resource: 'Identity',
              id: params.accountAddress,
            }),
        });

        if (account) {
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

        // Try to find App identity by signaturePublicKey
        const appIdentity = yield* Effect.tryPromise({
          try: () =>
            client.appIdentity.findFirst({
              where: {
                accountAddress: params.accountAddress,
                signaturePublicKey: params.signaturePublicKey,
              },
            }),
          catch: () =>
            new ResourceNotFoundError({
              resource: 'Identity',
              id: params.accountAddress,
            }),
        });

        if (!appIdentity) {
          return yield* Effect.fail(
            new ResourceNotFoundError({
              resource: 'Identity',
              id: params.accountAddress,
            }),
          );
        }

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
      const appIdentity = yield* Effect.tryPromise({
        try: () =>
          client.appIdentity.findFirst({
            where: {
              accountAddress: params.accountAddress,
              appId: params.appId,
            },
          }),
        catch: () =>
          new ResourceNotFoundError({
            resource: 'Identity',
            id: params.accountAddress,
          }),
      });

      if (!appIdentity) {
        return yield* Effect.fail(
          new ResourceNotFoundError({
            resource: 'Identity',
            id: params.accountAddress,
          }),
        );
      }

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
    })();

  return {
    getAppOrConnectIdentity,
  } as const;
})();

export const IdentityServiceLive = Layer.effect(IdentityService, makeIdentityService);
