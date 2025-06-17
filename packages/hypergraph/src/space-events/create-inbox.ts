import { secp256k1 } from '@noble/curves/secp256k1';
import { Effect } from 'effect';
import type { InboxSenderAuthPolicy } from '../inboxes/types.js';
import { canonicalize, generateId, hexToBytes, stringToUint8Array } from '../utils/index.js';
import type { Author, CreateSpaceInboxEvent } from './types.js';

export const createInbox = ({
  author,
  spaceId,
  inboxId,
  encryptionPublicKey,
  secretKey,
  isPublic,
  authPolicy,
  previousEventHash,
}: {
  author: Author;
  spaceId: string;
  inboxId: string;
  encryptionPublicKey: string;
  previousEventHash: string;
  secretKey: string;
  isPublic: boolean;
  authPolicy: InboxSenderAuthPolicy;
}): Effect.Effect<CreateSpaceInboxEvent, undefined> => {
  const transaction = {
    type: 'create-space-inbox' as const,
    id: generateId(),
    spaceId,
    inboxId,
    encryptionPublicKey,
    secretKey,
    isPublic,
    authPolicy,
    previousEventHash,
  };
  const signature = secp256k1.sign(
    stringToUint8Array(canonicalize(transaction)),
    hexToBytes(author.signaturePrivateKey),
    { prehash: true },
  );

  // Create a SpaceEvent to create the inbox and sign it
  const spaceEvent = {
    transaction,
    author: {
      accountAddress: author.accountAddress,
      signature: {
        hex: signature.toCompactHex(),
        recovery: signature.recovery,
      },
    },
  } satisfies CreateSpaceInboxEvent;

  return Effect.succeed(spaceEvent);
};
