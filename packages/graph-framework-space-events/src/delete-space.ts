import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';
import { canonicalize, stringToUint8Array } from 'graph-framework-utils';
import type { Author, SpaceEvent } from './types.js';

type Params = {
  author: Author;
  id: string;
};

export const deleteSpace = ({ author, id }: Params): Effect.Effect<SpaceEvent, undefined> => {
  const transaction = {
    type: 'delete-space' as const,
    id,
  };
  const encodedTransaction = stringToUint8Array(canonicalize(transaction));
  const signature = secp256k1.sign(encodedTransaction, author.signaturePrivateKey, { prehash: true }).toCompactHex();

  return Effect.succeed({
    transaction,
    author: {
      publicKey: author.signaturePublicKey,
      signature,
    },
  });
};
