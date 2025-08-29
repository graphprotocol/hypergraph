import { Identity, Messages, SpaceEvents, Utils } from '@graphprotocol/hypergraph';
import { Context, Effect, Layer } from 'effect';
import { DatabaseError, ValidationError } from '../http/errors.js';
import { DatabaseService } from './database.js';
import { IdentityService } from './identity.js';

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

export interface CreateSpaceParams {
  accountAddress: string;
  event: SpaceEvents.CreateSpaceEvent;
  keyBox: Messages.KeyBoxWithKeyId;
  infoContent: Uint8Array;
  infoSignatureHex: string;
  infoSignatureRecovery: number;
  name: string;
}

export interface AddAppIdentityToSpacesParams {
  appIdentityAddress: string;
  accountAddress: string;
  spacesInput: Messages.RequestConnectAddAppIdentityToSpaces['spacesInput'];
}

export interface SpacesService {
  readonly listByAccount: (accountAddress: string) => Effect.Effect<SpaceInfo[], never>;
  readonly createSpace: (params: CreateSpaceParams) => Effect.Effect<{ id: string }, ValidationError | DatabaseError>;
  readonly addAppIdentityToSpaces: (params: AddAppIdentityToSpacesParams) => Effect.Effect<void, DatabaseError>;
}

export const SpacesService = Context.GenericTag<SpacesService>('SpacesService');

export const makeSpacesService = Effect.fn(function* () {
  const { client } = yield* DatabaseService;
  const identityService = yield* IdentityService;

  const listByAccount = (accountAddress: string) =>
    Effect.fn(function* () {
      const spaces = yield* Effect.tryPromise({
        try: () =>
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
        catch: (error) =>
          new DatabaseError({
            operation: 'listSpacesByAccount',
            cause: error,
          }),
      });

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
    })();

  const createSpace = (params: CreateSpaceParams) =>
    Effect.fn(function* () {
      const { accountAddress, event, keyBox, infoContent, infoSignatureHex, infoSignatureRecovery, name } = params;

      // Create the getVerifiedIdentity function for space event validation
      const getVerifiedIdentity = (accountAddressToFetch: string, publicKey: string) => {
        // applySpaceEvent is only allowed to be called by the account that is applying the event
        if (accountAddressToFetch !== accountAddress) {
          return Effect.fail(new Identity.InvalidIdentityError());
        }

        return Effect.fn(function* () {
          const identity = yield* identityService
            .getAppOrConnectIdentity({
              accountAddress: accountAddressToFetch,
              signaturePublicKey: publicKey,
            })
            .pipe(Effect.mapError(() => new Identity.InvalidIdentityError()));
          return identity;
        })();
      };

      // Validate the space event
      const result = yield* SpaceEvents.applyEvent({
        event,
        state: undefined,
        getVerifiedIdentity,
      });

      const keyBoxId = `${keyBox.id}-${accountAddress}`;

      // Create the space in the database
      const spaceEvent = yield* Effect.tryPromise({
        try: () =>
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
        catch: (error) =>
          new DatabaseError({
            operation: 'createSpace',
            cause: error,
          }),
      });

      return { id: spaceEvent.id };
    })();

  const addAppIdentityToSpaces = (params: AddAppIdentityToSpacesParams) =>
    Effect.fn(function* () {
      const { appIdentityAddress, accountAddress, spacesInput } = params;

      yield* Effect.tryPromise({
        try: () =>
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
        catch: (error) =>
          new DatabaseError({
            operation: 'addAppIdentityToSpaces',
            cause: error,
          }),
      });
    })();

  return {
    listByAccount,
    createSpace,
    addAppIdentityToSpaces,
  } as const;
})();

export const SpacesServiceLive = Layer.effect(SpacesService, makeSpacesService);
