import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { hexToBytes } from '../utils/hexBytesAddressUtils.js';
import { canonicalize } from '../utils/jsc.js';
import { stringToUint8Array } from '../utils/stringToUint8Array.js';

import type { Author, DeleteSpaceEvent, SpaceEvent } from './types.js';

export type DeleteSpaceParams = {
  author: Author;
  id: string;
  previousEventHash: string;
};
export const deleteSpace = ({
  author,
  id,
  previousEventHash,
}: DeleteSpaceParams): Effect.Effect<SpaceEvent, undefined> => {
  const transaction = {
    type: 'delete-space' as const,
    id,
    previousEventHash,
  };
  const encodedTransaction = stringToUint8Array(canonicalize(transaction));
  const signature = secp256k1
    .sign(encodedTransaction, hexToBytes(author.signaturePrivateKey), { prehash: true })
    .toCompactHex();

  const event: DeleteSpaceEvent = {
    transaction,
    author: {
      accountId: author.accountId,
      publicKey: author.signaturePublicKey,
      signature,
    },
  };
  return Effect.succeed(event);
};
