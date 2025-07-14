import { Effect, Exit } from 'effect';

import type { Messages } from '@graphprotocol/hypergraph';

import { Identity, SpaceEvents } from '@graphprotocol/hypergraph';

import { prisma } from '../prisma.js';
import { getAppOrConnectIdentity } from './getAppOrConnectIdentity.js';

type Params = {
  accountAddress: string;
  event: SpaceEvents.CreateSpaceEvent;
  keyBox: Messages.KeyBoxWithKeyId;
  infoContent: Uint8Array;
  infoSignatureHex: string;
  infoSignatureRecovery: number;
  name: string; // TODO: remove this field and use infoContent instead
};

export const createSpace = async ({
  accountAddress,
  event,
  keyBox,
  infoContent,
  infoSignatureHex,
  infoSignatureRecovery,
  name,
}: Params) => {
  const getVerifiedIdentity = (accountAddressToFetch: string, publicKey: string) => {
    // applySpaceEvent is only allowed to be called by the account that is applying the event
    if (accountAddressToFetch !== accountAddress) {
      return Effect.fail(new Identity.InvalidIdentityError());
    }

    return Effect.gen(function* () {
      const identity = yield* Effect.tryPromise({
        try: () => getAppOrConnectIdentity({ accountAddress: accountAddressToFetch, signaturePublicKey: publicKey }),
        catch: () => new Identity.InvalidIdentityError(),
      });
      return identity;
    });
  };

  const result = await Effect.runPromiseExit(SpaceEvents.applyEvent({ event, state: undefined, getVerifiedIdentity }));
  if (Exit.isFailure(result)) {
    console.error('Create space: Invalid event', result.cause);
    throw new Error('Invalid event');
  }

  const keyBoxId = `${keyBox.id}-${accountAddress}`;

  return await prisma.spaceEvent.create({
    data: {
      event: JSON.stringify(event),
      id: event.transaction.id,
      counter: 0,
      state: JSON.stringify(result.value),
      space: {
        create: {
          id: event.transaction.id,
          infoContent,
          infoSignatureHex,
          infoSignatureRecovery,
          infoAuthorAddress: accountAddress,
          name, // TODO: remove this field and use infoContent instead
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
  });
};
