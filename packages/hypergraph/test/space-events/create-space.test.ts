import { Effect } from 'effect';
import { expect, it } from 'vitest';

import { InvalidIdentityError } from '../../src/identity/types.js';
import { applyEvent } from '../../src/space-events/apply-event.js';
import { createSpace } from '../../src/space-events/create-space.js';

it('should create a space state', async () => {
  const author = {
    accountId: '0x12345678',
    signaturePublicKey: '0x03594161eed61407084114a142d1ce05ef4c5a5279479fdd73a2b16944fbff003b',
    signaturePrivateKey: '0x76b78f644c19d6133018a97a3bc2d5038be0af5a2858b9e640ff3e2f2db63a0b',
    encryptionPublicKey: 'encryption',
  };

  const getVerifiedIdentity = (accountId: string) => {
    if (accountId === author.accountId) {
      return Effect.succeed(author);
    }
    return Effect.fail(new InvalidIdentityError());
  };

  const state = await Effect.runPromise(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      return yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });
    }),
  );

  expect(state.id).toBeTypeOf('string');
  expect(state.invitations).toEqual({});
  expect(state.members).toEqual({
    [author.accountId]: {
      accountId: author.accountId,
      role: 'admin',
    },
  });
  expect(state.removedMembers).toEqual({});
  expect(state.lastEventHash).toBeTypeOf('string');
});
