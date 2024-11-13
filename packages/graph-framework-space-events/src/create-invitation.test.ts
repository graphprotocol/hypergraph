import { expect, it } from 'vitest';

import { Effect } from 'effect';
import { applyEvent } from './apply-event.js';
import { createInvitation } from './create-invitation.js';
import { createSpace } from './create-space.js';

it('should create an invitation', async () => {
  const author = {
    signaturePublicKey: '03594161eed61407084114a142d1ce05ef4c5a5279479fdd73a2b16944fbff003b',
    signaturePrivateKey: '76b78f644c19d6133018a97a3bc2d5038be0af5a2858b9e640ff3e2f2db63a0b',
    encryptionPublicKey: 'encryption',
  };

  const { spaceEvent2, state2 } = await Effect.runPromise(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent });
      const spaceEvent2 = yield* createInvitation({ author, id: state.id, previousEventHash: state.lastEventHash });
      const state2 = yield* applyEvent({ state, event: spaceEvent2 });
      return {
        state2,
        spaceEvent2,
      };
    }),
  );

  expect(state2.id).toBeTypeOf('string');
  expect(state2.invitations).toEqual({
    [spaceEvent2.transaction.id]: {
      signaturePublicKey: '',
      encryptionPublicKey: '',
    },
  });
  expect(state2.members).toEqual({
    [author.signaturePublicKey]: {
      signaturePublicKey: author.signaturePublicKey,
      encryptionPublicKey: author.encryptionPublicKey,
      role: 'admin',
    },
  });
  expect(state2.removedMembers).toEqual({});
  expect(state2.lastEventHash).toBeTypeOf('string');
});
