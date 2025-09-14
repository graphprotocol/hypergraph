import { Identity, type Inboxes, type Messages, SpaceEvents, Utils } from '@graphprotocol/hypergraph';
import { Context, Effect, Exit, Layer } from 'effect';
import * as Predicate from 'effect/Predicate';
import { ResourceNotFoundError } from '../http/errors.js';
import * as DatabaseService from './database.js';
import * as IdentityService from './identity.js';

export interface SpaceInfo {
  id: string;
  infoContent: string;
  infoAuthorAddress: string;
  infoSignatureHex: string;
  infoSignatureRecovery: number;
  name: string;
  appIdentities: Array<{
    appId: string;
    address: string;
  }>;
  keyBoxes: Array<{
    id: string;
    ciphertext: string;
    nonce: string;
    authorPublicKey: string;
  }>;
}

export interface GetSpaceResult {
  id: string;
  name: string;
  events: SpaceEvents.SpaceEvent[];
  keyBoxes: Array<{
    id: string;
    ciphertext: string;
    nonce: string;
    authorPublicKey: string;
    accountAddress: string;
  }>;
  inboxes: Array<{
    inboxId: string;
    isPublic: boolean;
    authPolicy: Inboxes.InboxSenderAuthPolicy;
    encryptionPublicKey: string;
    secretKey: string;
  }>;
  updates:
    | {
        updates: Array<{
          accountAddress: string;
          update: Uint8Array;
          signature: {
            hex: string;
            recovery: number;
          };
          updateId: string;
        }>;
        firstUpdateClock: number;
        lastUpdateClock: number;
      }
    | undefined;
}

export interface SpaceListEntry {
  id: string;
  name: string;
}

export interface CreateSpaceParams {
  accountAddress: string;
  event: SpaceEvents.CreateSpaceEvent;
  keyBox: Messages.KeyBoxWithKeyId;
  infoContent: Uint8Array;
  infoSignatureHex: string;
  infoSignatureRecovery: number;
  name: string;
}

export interface GetSpaceParams {
  spaceId: string;
  accountAddress: string;
  appIdentityAddress: string;
}

export interface AddAppIdentityToSpacesParams {
  appIdentityAddress: string;
  accountAddress: string;
  spacesInput: Messages.RequestConnectAddAppIdentityToSpaces['spacesInput'];
}

export interface ApplySpaceEventParams {
  accountAddress: string;
  spaceId: string;
  event: SpaceEvents.SpaceEvent;
  keyBoxes: Messages.KeyBoxWithKeyId[];
}

export class SpacesService extends Context.Tag('SpacesService')<
  SpacesService,
  {
    readonly listByAccount: (accountAddress: string) => Effect.Effect<SpaceInfo[], DatabaseService.DatabaseError>;
    readonly createSpace: (
      params: CreateSpaceParams,
    ) => Effect.Effect<{ id: string }, SpaceEvents.ApplyError | DatabaseService.DatabaseError>;
    readonly addAppIdentityToSpaces: (
      params: AddAppIdentityToSpacesParams,
    ) => Effect.Effect<void, DatabaseService.DatabaseError>;
    readonly listByAppIdentity: (
      appIdentityAddress: string,
    ) => Effect.Effect<SpaceListEntry[], DatabaseService.DatabaseError>;
    readonly getSpace: (
      params: GetSpaceParams,
    ) => Effect.Effect<GetSpaceResult, ResourceNotFoundError | DatabaseService.DatabaseError>;
    readonly applySpaceEvent: (
      params: ApplySpaceEventParams,
    ) => Effect.Effect<void, Error | DatabaseService.DatabaseError>;
  }
>() {}

export const layer = Effect.gen(function* () {
  const { use } = yield* DatabaseService.DatabaseService;
  const { getAppOrConnectIdentity } = yield* IdentityService.IdentityService;

  const listByAccount = Effect.fn('listByAccount')(function* (accountAddress: string) {
    const spaces = yield* use((client) =>
      client.space.findMany({
        where: {
          members: {
            some: {
              address: accountAddress,
            },
          },
        },
        include: {
          appIdentities: {
            select: {
              address: true,
              appId: true,
            },
          },
          keys: {
            include: {
              keyBoxes: {
                where: {
                  accountAddress,
                },
              },
            },
          },
        },
      }),
    );

    return spaces.map((space) => ({
      id: space.id,
      infoContent: Utils.bytesToHex(space.infoContent),
      infoAuthorAddress: space.infoAuthorAddress,
      infoSignatureHex: space.infoSignatureHex,
      infoSignatureRecovery: space.infoSignatureRecovery,
      name: space.name,
      appIdentities: space.appIdentities.map((appIdentity) => ({
        appId: appIdentity.appId,
        address: appIdentity.address,
      })),
      keyBoxes: space.keys
        .filter((key) => key.keyBoxes.length > 0)
        .map((key) => ({
          id: key.id,
          ciphertext: key.keyBoxes[0].ciphertext,
          nonce: key.keyBoxes[0].nonce,
          authorPublicKey: key.keyBoxes[0].authorPublicKey,
        })),
    }));
  });

  const listByAppIdentity = Effect.fn('listByAppIdentity')(function* (appIdentityAddress: string) {
    return yield* use((client) =>
      client.space.findMany({
        where: {
          appIdentities: {
            some: {
              address: appIdentityAddress,
            },
          },
        },
        include: {
          appIdentities: {
            select: {
              address: true,
              appId: true,
            },
          },
          keys: {
            include: {
              keyBoxes: {
                where: {
                  appIdentityAddress,
                },
              },
            },
          },
        },
      }),
    );
  });

  const getSpace = Effect.fn('getSpace')(function* (params: GetSpaceParams) {
    const { spaceId, accountAddress, appIdentityAddress } = params;

    const space = yield* use((client) =>
      client.space.findUnique({
        where: {
          id: spaceId,
          members: {
            some: {
              address: accountAddress,
            },
          },
        },
        include: {
          events: {
            orderBy: {
              counter: 'asc',
            },
          },
          keys: {
            include: {
              keyBoxes: {
                where: {
                  accountAddress,
                  appIdentityAddress,
                },
                select: {
                  nonce: true,
                  ciphertext: true,
                  authorPublicKey: true,
                },
              },
            },
          },
          updates: {
            orderBy: {
              clock: 'asc',
            },
          },
          inboxes: {
            select: {
              id: true,
              isPublic: true,
              authPolicy: true,
              encryptionPublicKey: true,
              encryptedSecretKey: true,
            },
          },
        },
      }),
    ).pipe(
      Effect.filterOrFail(Predicate.isNotNull, () => new ResourceNotFoundError({ resource: 'Space', id: spaceId })),
    );

    const keyBoxes = space.keys.flatMap((key) => {
      return {
        id: key.id,
        nonce: key.keyBoxes[0].nonce,
        ciphertext: key.keyBoxes[0].ciphertext,
        accountAddress,
        authorPublicKey: key.keyBoxes[0].authorPublicKey,
      };
    });

    return {
      id: space.id,
      name: space.name,
      events: space.events.map((wrapper) => JSON.parse(wrapper.event)),
      keyBoxes,
      inboxes: space.inboxes.map((inbox) => ({
        inboxId: inbox.id,
        isPublic: inbox.isPublic,
        authPolicy: inbox.authPolicy as Inboxes.InboxSenderAuthPolicy,
        encryptionPublicKey: inbox.encryptionPublicKey,
        secretKey: inbox.encryptedSecretKey,
      })),
      updates:
        space.updates.length > 0
          ? {
              updates: space.updates.map((update) => ({
                accountAddress: update.accountAddress,
                update: new Uint8Array(update.content),
                signature: {
                  hex: update.signatureHex,
                  recovery: update.signatureRecovery,
                },
                updateId: update.updateId,
              })),
              firstUpdateClock: space.updates[0].clock,
              lastUpdateClock: space.updates[space.updates.length - 1].clock,
            }
          : undefined,
    };
  });

  const createSpace = Effect.fn('createSpace')(function* (params: CreateSpaceParams) {
    const { accountAddress, event, keyBox, infoContent, infoSignatureHex, infoSignatureRecovery, name } = params;

    // Create the getVerifiedIdentity function for space event validation
    const getVerifiedIdentity = Effect.fn('getVerifiedIdentity')(function* (
      accountAddressToFetch: string,
      publicKey: string,
    ) {
      // applySpaceEvent is only allowed to be called by the account that is applying the event
      if (accountAddressToFetch !== accountAddress) {
        return yield* new Identity.InvalidIdentityError();
      }

      const identity = yield* getAppOrConnectIdentity({
        accountAddress: accountAddressToFetch,
        signaturePublicKey: publicKey,
      }).pipe(Effect.mapError(() => new Identity.InvalidIdentityError()));

      return identity;
    });

    // Validate the space event
    const result = yield* SpaceEvents.applyEvent({
      event,
      state: undefined,
      getVerifiedIdentity,
    });

    const keyBoxId = `${keyBox.id}-${accountAddress}`;

    // Create the space in the database
    const spaceEvent = yield* use((client) =>
      client.spaceEvent.create({
        data: {
          event: JSON.stringify(event),
          id: event.transaction.id,
          counter: 0,
          state: JSON.stringify(result),
          space: {
            create: {
              id: event.transaction.id,
              infoContent,
              infoSignatureHex,
              infoSignatureRecovery,
              infoAuthorAddress: accountAddress,
              name,
              members: {
                connect: {
                  address: accountAddress,
                },
              },
              keys: {
                create: {
                  id: keyBox.id,
                  keyBoxes: {
                    create: {
                      id: keyBoxId,
                      nonce: keyBox.nonce,
                      ciphertext: keyBox.ciphertext,
                      authorPublicKey: keyBox.authorPublicKey,
                      account: {
                        connect: {
                          address: accountAddress,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    );

    return { id: spaceEvent.id };
  });

  const addAppIdentityToSpaces = Effect.fn('addAppIdentityToSpaces')(function* (params: AddAppIdentityToSpacesParams) {
    const { appIdentityAddress, accountAddress, spacesInput } = params;

    yield* use((client) =>
      client.$transaction(async (prisma) => {
        // Update app identity to connect it to spaces
        await prisma.appIdentity.update({
          where: {
            address: appIdentityAddress,
            accountAddress,
          },
          data: {
            spaces: {
              connect: spacesInput.map((space) => ({ id: space.id })),
            },
          },
        });

        // Create key boxes for the app identity
        const keyBoxes = spacesInput.flatMap((entry) => {
          return entry.keyBoxes.map((keyBox) => {
            const keyBoxId = `${keyBox.id}-${appIdentityAddress}`;

            return {
              id: keyBoxId,
              spaceKeyId: keyBox.id,
              ciphertext: keyBox.ciphertext,
              nonce: keyBox.nonce,
              authorPublicKey: keyBox.authorPublicKey,
              accountAddress,
              appIdentityAddress,
            };
          });
        });

        await prisma.spaceKeyBox.createMany({
          data: keyBoxes,
        });
      }),
    );
  });

  const applySpaceEvent = Effect.fn('applySpaceEvent')(function* (params: ApplySpaceEventParams) {
    const { accountAddress, spaceId, event, keyBoxes } = params;

    if (event.transaction.type === 'create-space') {
      return yield* Effect.fail(new Error('applySpaceEvent does not support create-space events.'));
    }

    yield* use((client) =>
      client.$transaction(async (transaction) => {
        if (event.transaction.type === 'accept-invitation') {
          // verify that the account is the invitee
          await transaction.invitation.findFirstOrThrow({
            where: { inviteeAccountAddress: event.author.accountAddress },
          });
        } else {
          // verify that the account is a member of the space
          // TODO verify that the account is an admin of the space
          await transaction.space.findUniqueOrThrow({
            where: {
              id: spaceId,
              members: { some: { address: accountAddress } },
            },
          });
        }

        const lastEvent = await transaction.spaceEvent.findFirstOrThrow({
          where: { spaceId },
          orderBy: { counter: 'desc' },
        });

        // Create the getVerifiedIdentity function for event validation
        const getVerifiedIdentity = (accountAddressToFetch: string, publicKey: string) => {
          // applySpaceEvent is only allowed to be called by the account that is applying the event
          if (accountAddressToFetch !== accountAddress) {
            return Effect.fail(new Identity.InvalidIdentityError());
          }

          return getAppOrConnectIdentity({
            accountAddress: accountAddressToFetch,
            signaturePublicKey: publicKey,
          }).pipe(Effect.mapError(() => new Identity.InvalidIdentityError()));
        };

        const result = await Effect.runPromiseExit(
          SpaceEvents.applyEvent({
            event,
            state: JSON.parse(lastEvent.state),
            getVerifiedIdentity,
          }),
        );

        if (Exit.isFailure(result)) {
          throw new Error('Invalid event');
        }

        if (event.transaction.type === 'create-invitation') {
          const inviteeAccountAddress = event.transaction.inviteeAccountAddress;
          await transaction.invitation.create({
            data: {
              id: event.transaction.id,
              spaceId,
              accountAddress: event.author.accountAddress,
              inviteeAccountAddress,
            },
          });
          await transaction.spaceKeyBox.createMany({
            data: keyBoxes.map((keyBox) => ({
              id: `${keyBox.id}-${inviteeAccountAddress}`,
              nonce: keyBox.nonce,
              ciphertext: keyBox.ciphertext,
              accountAddress: inviteeAccountAddress,
              authorPublicKey: keyBox.authorPublicKey,
              spaceKeyId: keyBox.id,
            })),
          });
        }

        if (event.transaction.type === 'accept-invitation') {
          await transaction.invitation.delete({
            where: { spaceId_inviteeAccountAddress: { spaceId, inviteeAccountAddress: event.author.accountAddress } },
          });

          await transaction.space.update({
            where: { id: spaceId },
            data: { members: { connect: { address: event.author.accountAddress } } },
          });
        }

        await transaction.spaceEvent.create({
          data: {
            spaceId,
            counter: lastEvent.counter + 1,
            event: JSON.stringify(event),
            id: event.transaction.id,
            state: JSON.stringify(result.value),
          },
        });

        if (event.transaction.type === 'create-space-inbox') {
          await transaction.spaceInbox.create({
            data: {
              id: event.transaction.inboxId,
              isPublic: event.transaction.isPublic,
              authPolicy: event.transaction.authPolicy,
              encryptionPublicKey: event.transaction.encryptionPublicKey,
              encryptedSecretKey: event.transaction.secretKey,
              space: { connect: { id: spaceId } },
              spaceEvent: { connect: { id: event.transaction.id } },
            },
          });
        }
      }),
    );
  });

  return {
    listByAccount,
    listByAppIdentity,
    getSpace,
    createSpace,
    addAppIdentityToSpaces,
    applySpaceEvent,
  } as const;
}).pipe(Layer.effect(SpacesService), Layer.provide(DatabaseService.layer), Layer.provide(IdentityService.layer));
