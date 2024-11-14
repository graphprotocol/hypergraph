import { expect, it } from 'vitest';

import { Effect, Exit } from 'effect';
import { applyEvent } from './apply-event.js';
import { createInvitation } from './create-invitation.js';
import { createSpace } from './create-space.js';

const author = {
  signaturePublicKey: '03594161eed61407084114a142d1ce05ef4c5a5279479fdd73a2b16944fbff003b',
  signaturePrivateKey: '76b78f644c19d6133018a97a3bc2d5038be0af5a2858b9e640ff3e2f2db63a0b',
  encryptionPublicKey: 'encryption',
};

const invitee = {
  signaturePublicKey: '03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
  signaturePrivateKey: '1eee32d3bc202dcb5d17c3b1454fb541d2290cb941860735408f1bfe39e7bc15',
  encryptionPublicKey: 'encryption',
};

it('should create an invitation', async () => {
  const { spaceEvent2, state2 } = await Effect.runPromise(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent });
      const spaceEvent2 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee,
      });
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
      signaturePublicKey: '03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
      encryptionPublicKey: 'encryption',
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

it('should fail to invite the account twice', async () => {
  const result = await Effect.runPromiseExit(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent });
      const spaceEvent2 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee,
      });
      const state2 = yield* applyEvent({ state, event: spaceEvent2 });
      const spaceEvent3 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee,
      });
      return yield* applyEvent({ state: state2, event: spaceEvent3 });
    }),
  );

  expect(Exit.isFailure(result)).toBe(true);
});

it('should fail to invite an account that is already a member', async () => {
  const result = await Effect.runPromiseExit(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent });
      const spaceEvent2 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee: author, // inviting the author
      });
      yield* applyEvent({ state, event: spaceEvent2 });
    }),
  );

  expect(Exit.isFailure(result)).toBe(true);
});
