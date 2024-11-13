import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';
import { canonicalize, stringToUint8Array } from 'graph-framework-utils';
import type { Author, SpaceEvent } from './types.js';

type Params = {
  author: Author;
  id: string;
  previousEventHash: string;
};

export const createInvitation = ({ author, id, previousEventHash }: Params): Effect.Effect<SpaceEvent, undefined> => {
  const transaction = {
    type: 'create-invitation' as const,
    id,
    ciphertext: '',
    nonce: '',
    signaturePublicKey: '',
    encryptionPublicKey: '',
    previousEventHash,
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
