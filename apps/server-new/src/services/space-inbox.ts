import { Inboxes, type Messages, type SpaceEvents } from '@graphprotocol/hypergraph';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Predicate from 'effect/Predicate';
import { AuthorizationError, ResourceNotFoundError, ValidationError } from '../http/errors.js';
import * as DatabaseService from './database.js';
import * as IdentityService from './identity.js';

export interface SpaceInboxResult {
  inboxId: string;
  isPublic: boolean;
  authPolicy: Inboxes.InboxSenderAuthPolicy;
  encryptionPublicKey: string;
  creationEvent: SpaceEvents.CreateSpaceInboxEvent;
}

export class SpaceInboxService extends Context.Tag('SpaceInboxService')<
  SpaceInboxService,
  {
    readonly listPublicSpaceInboxes: (params: {
      spaceId: string;
    }) => Effect.Effect<SpaceInboxResult[], DatabaseService.DatabaseError>;
    readonly getSpaceInbox: (params: {
      spaceId: string;
      inboxId: string;
    }) => Effect.Effect<SpaceInboxResult, ResourceNotFoundError | DatabaseService.DatabaseError>;
    readonly postSpaceInboxMessage: (params: {
      spaceId: string;
      inboxId: string;
      message: Messages.RequestCreateSpaceInboxMessage;
    }) => Effect.Effect<
      Messages.InboxMessage,
      ResourceNotFoundError | ValidationError | AuthorizationError | DatabaseService.DatabaseError
    >;
  }
>() {}

export const layer = Effect.gen(function* () {
  const { use } = yield* DatabaseService.DatabaseService;
  const { getAppOrConnectIdentity } = yield* IdentityService.IdentityService;

  const listPublicSpaceInboxes = Effect.fn('listPublicSpaceInboxes')(function* ({ spaceId }: { spaceId: string }) {
    const inboxes = yield* use((client) =>
      client.spaceInbox.findMany({
        where: { spaceId, isPublic: true },
        select: {
          id: true,
          isPublic: true,
          authPolicy: true,
          encryptionPublicKey: true,
          spaceEvent: {
            select: {
              event: true,
            },
          },
        },
      }),
    );

    return inboxes.map((inbox) => ({
      inboxId: inbox.id,
      isPublic: inbox.isPublic,
      authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
      encryptionPublicKey: inbox.encryptionPublicKey,
      creationEvent: JSON.parse(inbox.spaceEvent.event) as SpaceEvents.CreateSpaceInboxEvent,
    }));
  });

  const getSpaceInbox = Effect.fn('getSpaceInbox')(function* ({
    spaceId,
    inboxId,
  }: {
    spaceId: string;
    inboxId: string;
  }) {
    const inbox = yield* use((client) =>
      client.spaceInbox.findUnique({
        where: { id: inboxId, spaceId },
        select: {
          id: true,
          isPublic: true,
          authPolicy: true,
          encryptionPublicKey: true,
          spaceEvent: {
            select: {
              event: true,
            },
          },
        },
      }),
    ).pipe(
      Effect.filterOrFail(
        Predicate.isNotNull,
        () =>
          new ResourceNotFoundError({
            resource: 'SpaceInbox',
            id: inboxId,
          }),
      ),
    );

    return {
      inboxId: inbox.id,
      isPublic: inbox.isPublic,
      authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
      encryptionPublicKey: inbox.encryptionPublicKey,
      creationEvent: JSON.parse(inbox.spaceEvent.event) as SpaceEvents.CreateSpaceInboxEvent,
    };
  });

  const postSpaceInboxMessage = Effect.fn(function* ({
    spaceId,
    inboxId,
    message,
  }: {
    spaceId: string;
    inboxId: string;
    message: Messages.RequestCreateSpaceInboxMessage;
  }) {
    // First get the inbox to validate it exists and get auth policy
    const spaceInbox = yield* getSpaceInbox({ spaceId, inboxId });

    // Validate auth policy requirements
    switch (spaceInbox.authPolicy) {
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
        try: () => Inboxes.recoverSpaceInboxMessageSigner(message, spaceId, inboxId),
        catch: () =>
          new ValidationError({
            field: 'signature',
            message: 'Invalid signature',
          }),
      });

      // Check if this public key corresponds to a user's identity
      const authorIdentity = yield* getAppOrConnectIdentity({
        accountAddress: message.authorAccountAddress,
        signaturePublicKey: authorPublicKey,
      }).pipe(
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
    const createdMessage = yield* use((client) =>
      client.$transaction(async (prisma) => {
        // Double-check the inbox exists and belongs to the correct space
        const inbox = await prisma.spaceInbox.findUnique({
          where: { id: inboxId },
        });

        if (!inbox) {
          throw new Error('Space inbox not found');
        }

        if (inbox.spaceId !== spaceId) {
          throw new Error('Incorrect space');
        }

        // Create the message
        const created = await prisma.spaceInboxMessage.create({
          data: {
            spaceInbox: {
              connect: { id: inbox.id },
            },
            ciphertext: message.ciphertext,
            signatureHex: message.signature?.hex ?? null,
            signatureRecovery: message.signature?.recovery ?? null,
            authorAccountAddress: message.authorAccountAddress ?? null,
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
    );

    // TODO: Broadcast the message (WebSocket functionality would go here)
    // broadcastSpaceInboxMessage({ spaceId, inboxId, message: createdMessage });

    return createdMessage;
  });

  return {
    listPublicSpaceInboxes,
    getSpaceInbox,
    postSpaceInboxMessage,
  } as const;
}).pipe(Layer.effect(SpaceInboxService), Layer.provide(DatabaseService.layer), Layer.provide(IdentityService.layer));
