import { Effect } from 'effect';
import { expect, it } from 'vitest';
import { applyEvent } from './apply-event.js';
import { createSpace } from './create-space.js';
import { deleteSpace } from './delete-space.js';

it('should delete a space', async () => {
  const author = {
    signaturePublicKey: '03594161eed61407084114a142d1ce05ef4c5a5279479fdd73a2b16944fbff003b',
    signaturePrivateKey: '76b78f644c19d6133018a97a3bc2d5038be0af5a2858b9e640ff3e2f2db63a0b',
    encryptionPublicKey: 'encryption',
  };

  const state = await Effect.runPromise(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent });
      const spaceEvent2 = yield* deleteSpace({ author, id: state.id, previousEventHash: state.lastEventHash });
      return yield* applyEvent({ state, event: spaceEvent2 });
    }),
  );

  expect(state.id).toBeTypeOf('string');
  expect(state.invitations).toEqual({});
  expect(state.members).toEqual({});
  expect(state.removedMembers).toEqual({
    [author.signaturePublicKey]: {
      signaturePublicKey: author.signaturePublicKey,
      encryptionPublicKey: author.encryptionPublicKey,
      role: 'admin',
    },
  });
  expect(state.lastEventHash).toBeTypeOf('string');
});
