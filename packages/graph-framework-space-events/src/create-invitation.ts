import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';
import { canonicalize, generateId, stringToUint8Array } from 'graph-framework-utils';
import type { Author, CreateInvitationEvent } from './types.js';

type Params = {
  author: Author;
  previousEventHash: string;
  invitee: {
    signaturePublicKey: string;
    encryptionPublicKey: string;
  };
};

export const createInvitation = ({
  author,
  previousEventHash,
  invitee,
}: Params): Effect.Effect<CreateInvitationEvent, undefined> => {
  const transaction = {
    id: generateId(),
    type: 'create-invitation' as const,
    ciphertext: '',
    nonce: '',
    signaturePublicKey: invitee.signaturePublicKey,
    encryptionPublicKey: invitee.encryptionPublicKey,
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
