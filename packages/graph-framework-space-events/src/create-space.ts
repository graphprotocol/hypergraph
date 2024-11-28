import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { canonicalize, generateId, stringToUint8Array } from 'graph-framework-utils';

import type { Author, CreateSpaceEvent } from './types.js';

type Params = {
  author: Author;
};

export const createSpace = ({ author }: Params): Effect.Effect<CreateSpaceEvent, undefined> => {
  const transaction = {
    type: 'create-space' as const,
    id: generateId(),
    creatorSignaturePublicKey: author.signaturePublicKey,
    creatorEncryptionPublicKey: author.encryptionPublicKey,
  };
  const encodedTransaction = stringToUint8Array(canonicalize(transaction));
  const signature = secp256k1.sign(encodedTransaction, author.signaturePrivateKey, { prehash: true }).toCompactHex();

  const event: CreateSpaceEvent = {
    transaction,
    author: {
      publicKey: author.signaturePublicKey,
      signature,
    },
  };

  return Effect.succeed(event);
};
