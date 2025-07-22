import { secp256k1 } from '@noble/curves/secp256k1';
import { Cause, Effect, Exit } from 'effect';
import { expect, it } from 'vitest';
import { InvalidIdentityError, type PublicIdentity } from '../../src/identity/types.js';
import { applyEvent } from '../../src/space-events/apply-event.js';
import { createInvitation } from '../../src/space-events/create-invitation.js';
import { createSpace } from '../../src/space-events/create-space.js';
import { InvalidEventError, VerifySignatureError } from '../../src/space-events/types.js';
import { canonicalize } from '../../src/utils/jsc.js';
import { stringToUint8Array } from '../../src/utils/stringToUint8Array.js';

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

it('should fail in case of an invalid signature', async () => {
  const result = await Effect.runPromiseExit(
    Effect.gen(function* () {
      const spaceEvent = yield* createSpace({ author });

      const emptyTransaction = stringToUint8Array(canonicalize({}));
      const signature = secp256k1.sign(emptyTransaction, author.signaturePrivateKey, { prehash: true }).toCompactHex();

      // @ts-expect-error
      spaceEvent.author.signature = signature;
      return yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });
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
      const state = yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });

      const spaceEvent2 = yield* createInvitation({ author, previousEventHash: state.lastEventHash, invitee });
      return yield* applyEvent({ event: spaceEvent2, state: undefined, getVerifiedIdentity });
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
      const state = yield* applyEvent({ event: spaceEvent, state: undefined, getVerifiedIdentity });

      const spaceEvent2 = yield* createSpace({ author });
      const state2 = yield* applyEvent({ event: spaceEvent2, state, getVerifiedIdentity });

      const spaceEvent3 = yield* createInvitation({ author, previousEventHash: state.lastEventHash, invitee });
      return yield* applyEvent({ event: spaceEvent3, state: state2, getVerifiedIdentity });
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
