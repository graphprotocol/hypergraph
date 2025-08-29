import * as Effect from "effect/Effect";
import { ResourceAlreadyExistsError, ResourceNotFoundError } from '../http/errors.js';
import * as DatabaseService from './database.js';
import * as Predicate from "effect/Predicate";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

export interface ConnectIdentityResult {
  accountAddress: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  accountProof: string;
  keyProof: string;
}

export interface ConnectIdentityEncrypted {
  accountAddress: string;
  ciphertext: string;
  nonce: string;
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

export class ConnectIdentityService extends Context.Tag('ConnectIdentityService')<ConnectIdentityService, {
  readonly getByAccountAddress: (accountAddress: string) => Effect.Effect<ConnectIdentityResult, ResourceNotFoundError | DatabaseService.DatabaseError>;
  readonly getIdentityEncrypted: (
    accountAddress: string,
  ) => Effect.Effect<ConnectIdentityEncrypted, ResourceNotFoundError | DatabaseService.DatabaseError>;
  readonly createIdentity: (
    params: CreateConnectIdentityParams,
  ) => Effect.Effect<void, ResourceAlreadyExistsError | DatabaseService.DatabaseError>;
}>() {}

export const layer = Effect.gen(function* () {
  const { use } = yield* DatabaseService.DatabaseService;

  const getByAccountAddress = Effect.fn("getByAccountAddress")(function* (accountAddress: string) {
    const account = yield* use((client) =>
      client.account.findFirst({
        where: { address: accountAddress },
        select: {
          address: true,
          connectSignaturePublicKey: true,
          connectEncryptionPublicKey: true,
          connectAccountProof: true,
          connectKeyProof: true,
        },
      })
    ).pipe(Effect.filterOrFail(Predicate.isNotNull, () => new ResourceNotFoundError({
      resource: 'ConnectIdentity',
      id: accountAddress,
    })));

    return {
      accountAddress: account.address,
      signaturePublicKey: account.connectSignaturePublicKey,
      encryptionPublicKey: account.connectEncryptionPublicKey,
      accountProof: account.connectAccountProof,
      keyProof: account.connectKeyProof,
    };
  });

  const createIdentity = Effect.fn("createIdentity")(function* (params: CreateConnectIdentityParams) {
    // Check if identity already exists for this account
    yield* use((client) =>
      client.account.findFirst({
        where: {
          address: params.accountAddress,
        },
      }),
    ).pipe(Effect.filterOrFail(Predicate.isNull, () => new ResourceAlreadyExistsError({
      resource: 'ConnectIdentity',
      id: params.accountAddress,
    })));

    // Create the new identity
    yield* use((client) =>
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
    );
  });

  const getIdentityEncrypted = Effect.fn("getIdentityEncrypted")(function*  (accountAddress: string) {
      const account = yield* use((client) =>
        client.account.findFirst({
            where: { address: accountAddress },
            select: {
              address: true,
              connectCiphertext: true,
              connectNonce: true,
            },
          }),
      ).pipe(Effect.filterOrFail(Predicate.isNotNull, () => new ResourceNotFoundError({
        resource: 'ConnectIdentity',
        id: accountAddress,
      })));

      return {
        accountAddress: account.address,
        ciphertext: account.connectCiphertext,
        nonce: account.connectNonce,
      };
    });

  return {
    getByAccountAddress,
    getIdentityEncrypted,
    createIdentity,
  };
}).pipe(
  Layer.effect(ConnectIdentityService),
  Layer.provide(DatabaseService.layer)
)
