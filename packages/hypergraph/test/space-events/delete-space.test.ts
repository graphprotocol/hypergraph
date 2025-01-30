import { Cause, Effect, Exit } from 'effect';
import { expect, it } from 'vitest';

import { InvalidIdentityError } from '../../src/identity/types.js';
import { acceptInvitation } from '../../src/space-events/accept-invitation.js';
import { applyEvent } from '../../src/space-events/apply-event.js';
import { createInvitation } from '../../src/space-events/create-invitation.js';
import { createSpace } from '../../src/space-events/create-space.js';
import { deleteSpace } from '../../src/space-events/delete-space.js';
import { InvalidEventError } from '../../src/space-events/types.js';

const author = {
  accountId: '0x12345678',
  signaturePublicKey: '0x03594161eed61407084114a142d1ce05ef4c5a5279479fdd73a2b16944fbff003b',
  signaturePrivateKey: '0x76b78f644c19d6133018a97a3bc2d5038be0af5a2858b9e640ff3e2f2db63a0b',
  encryptionPublicKey: 'encryption',
};

const invitee = {
  accountId: '0x9abcdef0',
  signaturePublicKey: '0x03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
  signaturePrivateKey: '0x1eee32d3bc202dcb5d17c3b1454fb541d2290cb941860735408f1bfe39e7bc15',
  encryptionPublicKey: 'encryption',
};

const getVerifiedIdentity = (accountId: string) => {
  if (accountId === author.accountId) {
    return Effect.succeed(author);
  }
  if (accountId === invitee.accountId) {
    return Effect.succeed(invitee);
  }
  return Effect.fail(new InvalidIdentityError());
};

it('should delete a space', async () => {
  const state = await Effect.runPromise(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });
      const spaceEvent2 = yield* deleteSpace({ author, id: state.id, previousEventHash: state.lastEventHash });
      return yield* applyEvent({ event: spaceEvent2, state, getVerifiedIdentity });
    }),
  );

  expect(state.id).toBeTypeOf('string');
  expect(state.invitations).toEqual({});
  expect(state.members).toEqual({});
  expect(state.removedMembers).toEqual({
    [author.accountId]: {
      accountId: author.accountId,
      role: 'admin',
    },
  });
  expect(state.lastEventHash).toBeTypeOf('string');
});

it('should fail in case the author is not an admin', async () => {
  const result = await Effect.runPromiseExit(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });
      const spaceEvent2 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee,
      });
      const state2 = yield* applyEvent({ event: spaceEvent2, state, getVerifiedIdentity });
      const spaceEvent3 = yield* acceptInvitation({
        previousEventHash: state2.lastEventHash,
        author: invitee,
      });
      const state3 = yield* applyEvent({ event: spaceEvent3, state: state2, getVerifiedIdentity });
      const spaceEvent4 = yield* deleteSpace({
        author: invitee,
        previousEventHash: state.lastEventHash,
        id: state.id,
      });
      yield* applyEvent({ event: spaceEvent4, state: state3, getVerifiedIdentity });
    }),
  );

  expect(Exit.isFailure(result)).toBe(true);
  if (Exit.isFailure(result)) {
    const cause = result.cause;
    if (Cause.isFailType(cause)) {
      expect(cause.error).toBeInstanceOf(InvalidEventError);
    }
  }
});
