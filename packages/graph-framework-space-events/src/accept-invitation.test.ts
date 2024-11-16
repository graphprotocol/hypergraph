import { expect, it } from 'vitest';

import { Effect } from 'effect';
import { acceptInvitation } from './accept-invitation.js';
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

it('should accept an invitation', async () => {
  const { state3 } = await Effect.runPromise(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent });
      const spaceEvent2 = yield* createInvitation({
        author,
        previousEventHash: state.lastEventHash,
        invitee,
      });
      const state2 = yield* applyEvent({ state, event: spaceEvent2 });
      const spaceEvent3 = yield* acceptInvitation({
        previousEventHash: state2.lastEventHash,
        author: invitee,
      });
      const state3 = yield* applyEvent({ state: state2, event: spaceEvent3 });
      return {
        state3,
        spaceEvent3,
      };
    }),
  );

  expect(state3.id).toBeTypeOf('string');
  expect(state3.invitations).toEqual({});
  expect(state3.members).toEqual({
    [author.signaturePublicKey]: {
      signaturePublicKey: author.signaturePublicKey,
      encryptionPublicKey: author.encryptionPublicKey,
      role: 'admin',
    },
    [invitee.signaturePublicKey]: {
      signaturePublicKey: invitee.signaturePublicKey,
      encryptionPublicKey: invitee.encryptionPublicKey,
      role: 'member',
    },
  });
  expect(state3.removedMembers).toEqual({});
  expect(state3.lastEventHash).toBeTypeOf('string');
});
