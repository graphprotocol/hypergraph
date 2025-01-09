import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { generateId } from '../utils/generateId.js';
import { hexToBytes } from '../utils/hexBytesAddressUtils.js';
import { canonicalize } from '../utils/jsc.js';
import { stringToUint8Array } from '../utils/stringToUint8Array.js';

import type { AcceptInvitationEvent, Author } from './types.js';

export type AcceptInvitationParams = {
  author: Author;
  previousEventHash: string;
};
export const acceptInvitation = ({
  author,
  previousEventHash,
}: AcceptInvitationParams): Effect.Effect<AcceptInvitationEvent, undefined> => {
  const transaction = {
    id: generateId(),
    type: 'accept-invitation' as const,
    previousEventHash,
  };
  const encodedTransaction = stringToUint8Array(canonicalize(transaction));
  const signature = secp256k1
    .sign(encodedTransaction, hexToBytes(author.signaturePrivateKey), { prehash: true })
    .toCompactHex();

  return Effect.succeed({
    transaction,
    author: {
      accountId: author.accountId,
      publicKey: author.signaturePublicKey,
      signature,
    },
  });
};
