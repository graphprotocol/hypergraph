import { Context, Effect, Layer } from 'effect';
import { DatabaseError, ResourceAlreadyExistsError, ResourceNotFoundError } from '../http/errors.js';
import { DatabaseService } from './database.js';

export interface ConnectIdentityResult {
  accountAddress: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
}

export interface CreateConnectIdentityParams {
  signerAddress: string;
  accountAddress: string;
  ciphertext: string;
  nonce: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
}

export interface ConnectIdentityService {
  readonly getByAccountAddress: (accountAddress: string) => Effect.Effect<ConnectIdentityResult, ResourceNotFoundError>;
  readonly createIdentity: (params: CreateConnectIdentityParams) => Effect.Effect<void, ResourceAlreadyExistsError | DatabaseError>;
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

  const createIdentity = (params: CreateConnectIdentityParams) =>
    Effect.fn(function* () {
      // Check if identity already exists for this account
      const existingIdentity = yield* Effect.tryPromise({
        try: () =>
          client.account.findFirst({
            where: {
              address: params.accountAddress,
            },
          }),
        catch: (error) =>
          new DatabaseError({
            operation: 'createIdentity',
            cause: error,
          }),
      });

      if (existingIdentity) {
        yield* new ResourceAlreadyExistsError({
          resource: 'ConnectIdentity',
          id: params.accountAddress,
        });
      }

      // Create the new identity
      yield* Effect.tryPromise({
        try: () =>
          client.account.create({
            data: {
              connectSignerAddress: params.signerAddress,
              address: params.accountAddress,
              connectAccountProof: params.accountProof,
              connectKeyProof: params.keyProof,
              connectSignaturePublicKey: params.signaturePublicKey,
              connectEncryptionPublicKey: params.encryptionPublicKey,
              connectCiphertext: params.ciphertext,
              connectNonce: params.nonce,
              connectAddress: params.accountAddress,
            },
          }),
        catch: (error) =>
          new DatabaseError({
            operation: 'createIdentity',
            cause: error,
          }),
      });
    })();

  return {
    getByAccountAddress,
    createIdentity,
  } as const;
})();

export const ConnectIdentityServiceLive = Layer.effect(ConnectIdentityService, makeConnectIdentityService);
