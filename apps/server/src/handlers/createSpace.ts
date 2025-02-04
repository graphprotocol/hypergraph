import { Effect, Exit } from 'effect';

import type { Messages } from '@graphprotocol/hypergraph';

import { Identity, SpaceEvents } from '@graphprotocol/hypergraph';

import { prisma } from '../prisma.js';
import { getIdentity } from './getIdentity.js';

type Params = {
  accountId: string;
  event: SpaceEvents.CreateSpaceEvent;
  keyBox: Messages.KeyBox;
  keyId: string;
};

export const createSpace = async ({ accountId, event, keyBox, keyId }: Params) => {
  const getVerifiedIdentity = (accountIdToFetch: string) => {
    // applySpaceEvent is only allowed to be called by the account that is applying the event
    if (accountIdToFetch !== accountId) {
      return Effect.fail(new Identity.InvalidIdentityError());
    }

    return Effect.gen(function* () {
      const identity = yield* Effect.tryPromise({
        try: () => getIdentity({ accountId: accountIdToFetch }),
        catch: () => new Identity.InvalidIdentityError(),
      });
      return identity;
    });
  };

  const result = await Effect.runPromiseExit(SpaceEvents.applyEvent({ event, state: undefined, getVerifiedIdentity }));
  if (Exit.isFailure(result)) {
    throw new Error('Invalid event');
  }

  return await prisma.spaceEvent.create({
    data: {
      event: JSON.stringify(event),
      id: event.transaction.id,
      counter: 0,
      state: JSON.stringify(result.value),
      space: {
        create: {
          id: event.transaction.id,
          members: {
            connect: {
              id: accountId,
            },
          },
          keys: {
            create: {
              id: keyId,
              keyBoxes: {
                create: {
                  id: `${keyId}-${accountId}`,
                  nonce: keyBox.nonce,
                  ciphertext: keyBox.ciphertext,
                  accountId: accountId,
                  authorPublicKey: keyBox.authorPublicKey,
                },
              },
            },
          },
        },
      },
    },
  });
};
