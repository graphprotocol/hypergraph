import { Cause, Effect, Exit } from 'effect';
import { expect, it } from 'vitest';

import { InvalidIdentityError } from '../../src/identity/types.js';
import { acceptInvitation } from '../../src/space-events/accept-invitation.js';
import { applyEvent } from '../../src/space-events/apply-event.js';
import { createInvitation } from '../../src/space-events/create-invitation.js';
import { createSpace } from '../../src/space-events/create-space.js';
import { InvalidEventError } from '../../src/space-events/types.js';

const author = {
  accountAddress: '0x12345678',
  signaturePublicKey: '0x03594161eed61407084114a142d1ce05ef4c5a5279479fdd73a2b16944fbff003b',
  signaturePrivateKey: '0x76b78f644c19d6133018a97a3bc2d5038be0af5a2858b9e640ff3e2f2db63a0b',
  encryptionPublicKey: 'encryption',
};

const invitee = {
  accountAddress: '0x9abcdef0',
  signaturePublicKey: '0x03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
  signaturePrivateKey: '0x1eee32d3bc202dcb5d17c3b1454fb541d2290cb941860735408f1bfe39e7bc15',
  encryptionPublicKey: 'encryption',
};

const invitee2 = {
  accountAddress: '0x1a2b3c4d',
  signaturePublicKey: '0x0351460706cf386282d9b6ebee2ccdcb9ba61194fd024345e53037f3036242e6a2',
  signaturePrivateKey: '0x434518a2c9a665a7c20da086232c818b6c1592e2edfeecab29a40cf5925ca8fe',
  encryptionPublicKey: 'encryption',
};

const getVerifiedIdentity = (accountAddress: string) => {
  if (accountAddress === author.accountAddress) {
    return Effect.succeed(author);
  }
  if (accountAddress === invitee.accountAddress) {
    return Effect.succeed(invitee);
  }
  if (accountAddress === invitee2.accountAddress) {
    return Effect.succeed(invitee2);
  }
  return Effect.fail(new InvalidIdentityError());
};

it('should create an invitation', async () => {
  const { spaceEvent2, state2 } = await Effect.runPromise(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });
      const spaceEvent2 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee,
      });
      const state2 = yield* applyEvent({ event: spaceEvent2, state, getVerifiedIdentity });
      return {
        state2,
        spaceEvent2,
      };
    }),
  );

  expect(state2.id).toBeTypeOf('string');
  expect(state2.invitations).toEqual({
    [spaceEvent2.transaction.id]: {
      inviteeAccountAddress: invitee.accountAddress,
    },
  });
  expect(state2.members).toEqual({
    [author.accountAddress]: {
      accountAddress: author.accountAddress,
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
      const state = yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });
      const spaceEvent2 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee,
      });
      const state2 = yield* applyEvent({ event: spaceEvent2, state, getVerifiedIdentity });
      const spaceEvent3 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee,
      });
      return yield* applyEvent({ state: state2, event: spaceEvent3, getVerifiedIdentity });
    }),
  );

  expect(Exit.isFailure(result)).toBe(true);
});

it('should fail to invite an account that is already a member', async () => {
  const result = await Effect.runPromiseExit(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });
      const spaceEvent2 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee: author, // inviting the author
      });
      yield* applyEvent({ event: spaceEvent2, state, getVerifiedIdentity });
    }),
  );

  expect(Exit.isFailure(result)).toBe(true);
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
      const spaceEvent4 = yield* createInvitation({
        author: invitee,
        previousEventHash: state.lastEventHash,
        invitee: invitee2,
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
