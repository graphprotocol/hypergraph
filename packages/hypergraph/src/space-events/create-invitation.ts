import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';

import { generateId } from '../utils/generateId.js';
import { hexToBytes } from '../utils/hexBytesAddressUtils.js';
import { canonicalize } from '../utils/jsc.js';
import { stringToUint8Array } from '../utils/stringToUint8Array.js';

import type { Author, CreateInvitationEvent } from './types.js';

export type CreateInvitationParams = {
  author: Author;
  previousEventHash: string;
  invitee: {
    accountId: string;
    signaturePublicKey: string;
    encryptionPublicKey: string;
  };
};
export const createInvitation = ({
  author,
  previousEventHash,
  invitee,
}: CreateInvitationParams): Effect.Effect<CreateInvitationEvent, undefined> => {
  const transaction = {
    id: generateId(),
    type: 'create-invitation' as const,
    ciphertext: '',
    nonce: '',
    inviteeAccountId: invitee.accountId,
    signaturePublicKey: invitee.signaturePublicKey,
    encryptionPublicKey: invitee.encryptionPublicKey,
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
