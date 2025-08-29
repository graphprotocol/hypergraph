import { Utils } from '@graphprotocol/hypergraph';
import { Context, Effect, Layer } from 'effect';
import { DatabaseError } from '../http/errors.js';
import { DatabaseService } from './database.js';

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

export interface SpacesService {
  readonly listByAccount: (accountAddress: string) => Effect.Effect<SpaceInfo[], never>;
}

export const SpacesService = Context.GenericTag<SpacesService>('SpacesService');

export const makeSpacesService = Effect.fn(function* () {
  const { client } = yield* DatabaseService;

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

  return {
    listByAccount,
  } as const;
})();

export const SpacesServiceLive = Layer.effect(SpacesService, makeSpacesService);