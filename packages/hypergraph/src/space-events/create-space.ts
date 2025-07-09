import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { canonicalize, generateId, hexToBytes, stringToUint8Array } from '../utils/index.js';
import type { Author, CreateSpaceEvent } from './types.js';

type Params = {
  author: Author;
  spaceId?: string;
};

export const createSpace = ({ author, spaceId }: Params): Effect.Effect<CreateSpaceEvent, undefined> => {
  const transaction = {
    type: 'create-space' as const,
    id: spaceId ?? generateId(),
    creatorAccountAddress: author.accountAddress,
  };
  const encodedTransaction = stringToUint8Array(canonicalize(transaction));
  const signatureResult = secp256k1.sign(encodedTransaction, hexToBytes(author.signaturePrivateKey), {
    prehash: true,
  });

  const event: CreateSpaceEvent = {
    transaction,
    author: {
      accountAddress: author.accountAddress,
      signature: {
        hex: signatureResult.toCompactHex(),
        recovery: signatureResult.recovery,
      },
    },
  };

  return Effect.succeed(event);
};
