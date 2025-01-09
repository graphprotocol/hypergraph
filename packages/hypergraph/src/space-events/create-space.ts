import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { generateId } from '../utils/generateId.js';
import { hexToBytes } from '../utils/hexBytesAddressUtils.js';
import { canonicalize } from '../utils/jsc.js';
import { stringToUint8Array } from '../utils/stringToUint8Array.js';

import type { Author, CreateSpaceEvent } from './types.js';

export type CreateSpaceParams = {
  author: Author;
};
export const createSpace = ({ author }: CreateSpaceParams): Effect.Effect<CreateSpaceEvent, undefined> => {
  const transaction = {
    type: 'create-space' as const,
    id: generateId(),
    creatorAccountId: author.accountId,
    creatorSignaturePublicKey: author.signaturePublicKey,
    creatorEncryptionPublicKey: author.encryptionPublicKey,
  };
  const encodedTransaction = stringToUint8Array(canonicalize(transaction));
  const signature = secp256k1
    .sign(encodedTransaction, hexToBytes(author.signaturePrivateKey), { prehash: true })
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
