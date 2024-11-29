import { Effect, Exit } from 'effect';

import type { KeyBox } from '@graph-framework/messages';
import { type CreateSpaceEvent, applyEvent } from '@graph-framework/space-events';

import { prisma } from '../prisma.js';

type Params = {
  accountId: string;
  event: CreateSpaceEvent;
  keyBox: KeyBox;
  keyId: string;
};

export const createSpace = async ({ accountId, event, keyBox, keyId }: Params) => {
  const result = await Effect.runPromiseExit(applyEvent({ event, state: undefined }));
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
