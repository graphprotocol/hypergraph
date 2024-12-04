import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { type Hex, canonicalize, generateId, hexToBytes, stringToUint8Array } from '@graph-framework/utils';

import type { Author, CreateSpaceEvent } from './types.js';

type Params = {
  author: Author;
};

export const createSpace = ({ author }: Params): Effect.Effect<CreateSpaceEvent, undefined> => {
  const transaction = {
    type: 'create-space' as const,
    id: generateId(),
    creatorAccountId: author.accountId,
    creatorSignaturePublicKey: author.signaturePublicKey,
    creatorEncryptionPublicKey: author.encryptionPublicKey,
  };
  const encodedTransaction = stringToUint8Array(canonicalize(transaction));
  const signature = secp256k1
    .sign(encodedTransaction, hexToBytes(author.signaturePrivateKey as Hex), { prehash: true })
    .toCompactHex();

  const event: CreateSpaceEvent = {
    transaction,
    author: {
      accountId: author.accountId,
      publicKey: author.signaturePublicKey,
      signature,
    },
  };

  return Effect.succeed(event);
};
