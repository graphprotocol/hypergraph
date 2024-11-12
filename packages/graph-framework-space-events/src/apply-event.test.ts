import { secp256k1 } from '@noble/curves/secp256k1';
import { Cause, Effect, Exit } from 'effect';
import { canonicalize, stringToUint8Array } from 'graph-framework-utils';
import { expect, it } from 'vitest';
import { applyEvent } from './apply-event.js';
import { createSpace } from './create-space.js';
import { VerifySignatureError } from './types.js';

it('should fail in case of an invalid signature', async () => {
  const author = {
    signaturePublicKey: '03594161eed61407084114a142d1ce05ef4c5a5279479fdd73a2b16944fbff003b',
    signaturePrivateKey: '76b78f644c19d6133018a97a3bc2d5038be0af5a2858b9e640ff3e2f2db63a0b',
    encryptionPublicKey: 'encryption',
  };

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
