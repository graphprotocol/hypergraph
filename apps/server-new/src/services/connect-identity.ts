import { Context, Effect, Layer } from 'effect';
import { ResourceNotFoundError } from '../http/errors.js';
import { DatabaseService } from './database.js';

export interface ConnectIdentityResult {
  accountAddress: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
}

export interface ConnectIdentityService {
  readonly getByAccountAddress: (accountAddress: string) => Effect.Effect<ConnectIdentityResult, ResourceNotFoundError>;
}

export const ConnectIdentityService = Context.GenericTag<ConnectIdentityService>('ConnectIdentityService');

export const makeConnectIdentityService = Effect.fn(function* () {
  const { client } = yield* DatabaseService;

  const getByAccountAddress = (accountAddress: string) =>
    Effect.fn(function* () {
      const account = yield* Effect.tryPromise({
        try: () =>
          client.account.findFirst({
            where: { address: accountAddress },
            select: {
              address: true,
              connectSignaturePublicKey: true,
              connectEncryptionPublicKey: true,
              connectAccountProof: true,
              connectKeyProof: true,
            },
          }),
        catch: () =>
          new ResourceNotFoundError({
            resource: 'ConnectIdentity',
            id: accountAddress,
          }),
      });

      if (!account) {
        return yield* Effect.fail(
          new ResourceNotFoundError({
            resource: 'ConnectIdentity',
            id: accountAddress,
          }),
        );
      }

      return {
        accountAddress: account.address,
        signaturePublicKey: account.connectSignaturePublicKey,
        encryptionPublicKey: account.connectEncryptionPublicKey,
        accountProof: account.connectAccountProof,
        keyProof: account.connectKeyProof,
      };
    })();

  return {
    getByAccountAddress,
  } as const;
})();

export const ConnectIdentityServiceLive = Layer.effect(ConnectIdentityService, makeConnectIdentityService);
