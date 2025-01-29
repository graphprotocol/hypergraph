import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { canonicalize, generateId, hexToBytes, stringToUint8Array } from '../utils/index.js';
import type { AcceptInvitationEvent, Author } from './types.js';

type Params = {
  author: Author;
  previousEventHash: string;
};

export const acceptInvitation = ({
  author,
  previousEventHash,
}: Params): Effect.Effect<AcceptInvitationEvent, undefined> => {
  const transaction = {
    id: generateId(),
    type: 'accept-invitation' as const,
    previousEventHash,
  };
  const encodedTransaction = stringToUint8Array(canonicalize(transaction));
  const signatureResult = secp256k1.sign(encodedTransaction, hexToBytes(author.signaturePrivateKey), {
    prehash: true,
  });

  return Effect.succeed({
    transaction,
    author: {
      accountId: author.accountId,
      signature: signatureResult.toCompactHex(),
      recovery: signatureResult.recovery,
    },
  });
};
