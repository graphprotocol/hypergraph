import { Inboxes, type Messages } from '@graphprotocol/hypergraph';
import { Context, Effect, Layer } from 'effect';
import { AuthorizationError, DatabaseError, ResourceNotFoundError, ValidationError } from '../http/errors.js';
import { DatabaseService } from './database.js';
import { IdentityService } from './identity.js';

export interface AccountInboxResult {
  inboxId: string;
  accountAddress: string;
  isPublic: boolean;
  authPolicy: Inboxes.InboxSenderAuthPolicy;
  encryptionPublicKey: string | null;
  signature: {
    hex: string;
    recovery: number;
  };
}

export interface AccountInboxService {
  readonly listPublicAccountInboxes: (params: {
    accountAddress: string;
  }) => Effect.Effect<AccountInboxResult[], DatabaseError>;
  readonly getAccountInbox: (params: {
    accountAddress: string;
    inboxId: string;
  }) => Effect.Effect<AccountInboxResult, ResourceNotFoundError | DatabaseError>;
  readonly postAccountInboxMessage: (params: {
    accountAddress: string;
    inboxId: string;
    message: Messages.RequestCreateAccountInboxMessage;
  }) => Effect.Effect<
    Messages.InboxMessage,
    ResourceNotFoundError | ValidationError | AuthorizationError | DatabaseError
  >;
}

export const AccountInboxService = Context.GenericTag<AccountInboxService>('AccountInboxService');

export const makeAccountInboxService = Effect.fn(function* () {
  const { client } = yield* DatabaseService;
  const identityService = yield* IdentityService;

  const listPublicAccountInboxes = ({ accountAddress }: { accountAddress: string }) =>
    Effect.fn(function* () {
      const inboxes = yield* Effect.tryPromise({
        try: () =>
          client.accountInbox.findMany({
            where: { accountAddress, isPublic: true },
            select: {
              id: true,
              isPublic: true,
              authPolicy: true,
              encryptionPublicKey: true,
              account: {
                select: {
                  address: true,
                },
              },
              signatureHex: true,
              signatureRecovery: true,
            },
          }),
        catch: (error) =>
          new DatabaseError({
            operation: 'listPublicAccountInboxes',
            cause: error,
          }),
      });

      return inboxes.map((inbox) => ({
        inboxId: inbox.id,
        accountAddress: inbox.account.address,
        isPublic: inbox.isPublic,
        authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
        encryptionPublicKey: inbox.encryptionPublicKey,
        signature: {
          hex: inbox.signatureHex,
          recovery: inbox.signatureRecovery,
        },
      }));
    })();

  const getAccountInbox = ({ accountAddress, inboxId }: { accountAddress: string; inboxId: string }) =>
    Effect.fn(function* () {
      const inbox = yield* Effect.tryPromise({
        try: () =>
          client.accountInbox.findUnique({
            where: { id: inboxId, accountAddress },
            select: {
              id: true,
              account: {
                select: {
                  address: true,
                },
              },
              isPublic: true,
              authPolicy: true,
              encryptionPublicKey: true,
              signatureHex: true,
              signatureRecovery: true,
            },
          }),
        catch: (error) =>
          new DatabaseError({
            operation: 'getAccountInbox',
            cause: error,
          }),
      });

      if (!inbox) {
        return yield* Effect.fail(
          new ResourceNotFoundError({
            resource: 'AccountInbox',
            id: inboxId,
          }),
        );
      }

      return {
        inboxId: inbox.id,
        accountAddress: inbox.account.address,
        isPublic: inbox.isPublic,
        authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
        encryptionPublicKey: inbox.encryptionPublicKey,
        signature: {
          hex: inbox.signatureHex,
          recovery: inbox.signatureRecovery,
        },
      };
    })();

  const postAccountInboxMessage = ({
    accountAddress,
    inboxId,
    message,
  }: {
    accountAddress: string;
    inboxId: string;
    message: Messages.RequestCreateAccountInboxMessage;
  }) =>
    Effect.fn(function* () {
      // First get the inbox to validate it exists and get auth policy
      const accountInbox = yield* getAccountInbox({ accountAddress, inboxId });

      // Validate auth policy requirements
      switch (accountInbox.authPolicy) {
        case 'requires_auth':
          if (!message.signature || !message.authorAccountAddress) {
            return yield* Effect.fail(
              new ValidationError({
                field: 'signature and authorAccountAddress',
                message: 'Signature and authorAccountAddress required',
              }),
            );
          }
          break;
        case 'anonymous':
          if (message.signature || message.authorAccountAddress) {
            return yield* Effect.fail(
              new ValidationError({
                field: 'signature and authorAccountAddress',
                message: 'Signature and authorAccountAddress not allowed',
              }),
            );
          }
          break;
        case 'optional_auth':
          if (
            (message.signature && !message.authorAccountAddress) ||
            (!message.signature && message.authorAccountAddress)
          ) {
            return yield* Effect.fail(
              new ValidationError({
                field: 'signature and authorAccountAddress',
                message: 'Signature and authorAccountAddress must be provided together',
              }),
            );
          }
          break;
        default:
          return yield* Effect.fail(
            new ValidationError({
              field: 'authPolicy',
              message: 'Unknown auth policy',
            }),
          );
      }

      // If signature and account provided, verify authorization
      if (message.signature && message.authorAccountAddress) {
        // Recover the public key from the signature
        const authorPublicKey = yield* Effect.try({
          try: () => Inboxes.recoverAccountInboxMessageSigner(message, accountAddress, inboxId),
          catch: () =>
            new ValidationError({
              field: 'signature',
              message: 'Invalid signature',
            }),
        });

        // Check if this public key corresponds to a user's identity
        const authorIdentity = yield* identityService
          .getAppOrConnectIdentity({
            accountAddress: message.authorAccountAddress,
            signaturePublicKey: authorPublicKey,
          })
          .pipe(
            Effect.catchAll(() =>
              Effect.fail(
                new AuthorizationError({
                  message: 'Not authorized to post to this inbox',
                  accountAddress: message.authorAccountAddress,
                }),
              ),
            ),
          );

        if (authorIdentity.accountAddress !== message.authorAccountAddress) {
          return yield* Effect.fail(
            new AuthorizationError({
              message: 'Not authorized to post to this inbox',
              accountAddress: message.authorAccountAddress,
            }),
          );
        }
      }

      // Create the message in the database
      const createdMessage = yield* Effect.tryPromise({
        try: () =>
          client.$transaction(async (prisma) => {
            // Double-check the inbox exists and belongs to the correct account
            const inbox = await prisma.accountInbox.findUnique({
              where: { id: inboxId, accountAddress },
            });

            if (!inbox) {
              throw new Error('Account inbox not found');
            }

            // Create the message
            const created = await prisma.accountInboxMessage.create({
              data: {
                ciphertext: message.ciphertext,
                signatureHex: message.signature?.hex ?? null,
                signatureRecovery: message.signature?.recovery ?? null,
                authorAccountAddress: message.authorAccountAddress ?? null,
                accountInbox: {
                  connect: { id: inbox.id },
                },
              },
            });

            return {
              id: created.id,
              ciphertext: created.ciphertext,
              signature:
                created.signatureHex != null && created.signatureRecovery != null
                  ? {
                      hex: created.signatureHex,
                      recovery: created.signatureRecovery,
                    }
                  : undefined,
              authorAccountAddress: created.authorAccountAddress ?? undefined,
              createdAt: created.createdAt,
            } as Messages.InboxMessage;
          }),
        catch: (error) =>
          new DatabaseError({
            operation: 'postAccountInboxMessage',
            cause: error,
          }),
      });

      // TODO: Broadcast the message (WebSocket functionality would go here)
      // broadcastAccountInboxMessage({ accountAddress, inboxId, message: createdMessage });

      return createdMessage;
    })();

  return {
    listPublicAccountInboxes,
    getAccountInbox,
    postAccountInboxMessage,
  } as const;
})();

export const AccountInboxServiceLive = Layer.effect(AccountInboxService, makeAccountInboxService);
