import { Effect } from 'effect';
import { expect, it } from 'vitest';

import { InvalidIdentityError, type PublicIdentity } from '../../src/identity/types.js';
import { acceptInvitation } from '../../src/space-events/accept-invitation.js';
import { applyEvent } from '../../src/space-events/apply-event.js';
import { createInvitation } from '../../src/space-events/create-invitation.js';
import { createSpace } from '../../src/space-events/create-space.js';

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

const getVerifiedIdentity = (accountAddress: string, publicKey: string) => {
  if (accountAddress === author.accountAddress && publicKey === author.signaturePublicKey) {
    return Effect.succeed(author as PublicIdentity);
  }
  if (accountAddress === invitee.accountAddress && publicKey === invitee.signaturePublicKey) {
    return Effect.succeed(invitee as PublicIdentity);
  }
  return Effect.fail(new InvalidIdentityError());
};

it('should accept an invitation', async () => {
  const { state3 } = await Effect.runPromise(
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
      return {
        state3,
        spaceEvent3,
      };
    }),
  );

  expect(state3.id).toBeTypeOf('string');
  expect(state3.invitations).toEqual({});
  expect(state3.members).toEqual({
    [author.accountAddress]: {
      accountAddress: author.accountAddress,
      role: 'admin',
    },
    [invitee.accountAddress]: {
      accountAddress: invitee.accountAddress,
      role: 'member',
    },
  });
  expect(state3.removedMembers).toEqual({});
  expect(state3.lastEventHash).toBeTypeOf('string');
});
