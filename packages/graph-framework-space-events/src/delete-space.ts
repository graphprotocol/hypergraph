import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { canonicalize, hexToBytes, stringToUint8Array } from '@graph-framework/utils';

import type { Author, DeleteSpaceEvent, SpaceEvent } from './types.js';

type Params = {
  author: Author;
  id: string;
  previousEventHash: string;
};

export const deleteSpace = ({ author, id, previousEventHash }: Params): Effect.Effect<SpaceEvent, undefined> => {
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
