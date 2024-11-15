import { secp256k1 } from '@noble/curves/secp256k1';
import { Cause, Effect, Exit } from 'effect';
import { canonicalize, stringToUint8Array } from 'graph-framework-utils';
import { expect, it } from 'vitest';
import { applyEvent } from './apply-event.js';
import { createInvitation } from './create-invitation.js';
import { createSpace } from './create-space.js';
import { InvalidEventError, VerifySignatureError } from './types.js';

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

it('should fail in case of an invalid signature', async () => {
  const result = await Effect.runPromiseExit(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });

      const emptyTransaction = stringToUint8Array(canonicalize({}));
      const signature = secp256k1.sign(emptyTransaction, author.signaturePrivateKey, { prehash: true }).toCompactHex();

      // @ts-expect-error
      spaceEvent.author.signature = signature;
      return yield* applyEvent({ event: spaceEvent });
    }),
  );

  expect(Exit.isFailure(result)).toBe(true);
  if (Exit.isFailure(result)) {
    const cause = result.cause;
    if (Cause.isFailType(cause)) {
      expect(cause.error).toBeInstanceOf(VerifySignatureError);
    }
  }
});

it('should fail in case state is not provided for an event other than createSpace', async () => {
  const result = await Effect.runPromiseExit(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent });

      const spaceEvent2 = yield* createInvitation({ author, previousEventHash: state.lastEventHash, invitee });
      return yield* applyEvent({ event: spaceEvent2 });
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

it('should fail in case of an event is applied that is not based on the previous event', async () => {
  const result = await Effect.runPromiseExit(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });
      const state = yield* applyEvent({ event: spaceEvent });

      const spaceEvent2 = yield* createSpace({ author });
      const state2 = yield* applyEvent({ state, event: spaceEvent2 });

      const spaceEvent3 = yield* createInvitation({ author, previousEventHash: state.lastEventHash, invitee });
      return yield* applyEvent({ state: state2, event: spaceEvent3 });
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
