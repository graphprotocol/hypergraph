import { Effect, Exit } from 'effect';

import type { Messages } from '@graphprotocol/hypergraph';

import { SpaceEvents } from '@graphprotocol/hypergraph';

import { prisma } from '../prisma.js';
import { getIdentity } from './getIdentity.js';

type Params = {
  accountId: string;
  event: SpaceEvents.CreateSpaceEvent;
  keyBox: Messages.KeyBox;
  keyId: string;
};

export const createSpace = async ({ accountId, event, keyBox, keyId }: Params) => {
  const identity = await getIdentity({ accountId });
  const result = await Effect.runPromiseExit(
    SpaceEvents.applyEvent({ event, state: undefined, getVerifiedIdentity: () => Effect.succeed(identity) }),
  );
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
