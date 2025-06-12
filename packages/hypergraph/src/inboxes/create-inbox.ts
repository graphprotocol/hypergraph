import { secp256k1 } from '@noble/curves/secp256k1';
import { randomBytes } from '@noble/hashes/utils';
import { cryptoBoxKeyPair } from '@serenity-kit/noble-sodium';
import { Effect } from 'effect';
import * as Messages from '../messages/index.js';
import * as SpaceEvents from '../space-events/index.js';
import { bytesToHex, canonicalize, hexToBytes, stringToUint8Array } from '../utils/index.js';
import type * as Inboxes from './types.js';

type CreateAccountInboxParams = {
  accountAddress: string;
  isPublic: boolean;
  authPolicy: Inboxes.InboxSenderAuthPolicy;
  encryptionPublicKey: string;
  signaturePrivateKey: string;

  // TODO: add optional schema
};

type CreateSpaceInboxParams = {
  author: SpaceEvents.Author;
  spaceId: string;
  isPublic: boolean;
  authPolicy: Inboxes.InboxSenderAuthPolicy;
  spaceSecretKey: string;
  previousEventHash: string;
};

// The caller should have already verified that the accountAddress, signaturePrivateKey and encryptionPublicKey belong to the same account
export function createAccountInboxCreationMessage({
  accountAddress,
  isPublic,
  authPolicy,
  encryptionPublicKey,
  signaturePrivateKey,
}: CreateAccountInboxParams): Messages.RequestCreateAccountInbox {
  // Generate a 32 byte random inbox id
  const inboxId = bytesToHex(randomBytes(32));

  // This message can prove to anyone wanting to send a message to the inbox that it is indeed from the account
  // and that the public key belongs to the account
  const messageToSign = stringToUint8Array(
    canonicalize({
      accountAddress,
      inboxId,
      encryptionPublicKey,
    }),
  );

  const signature = secp256k1.sign(messageToSign, hexToBytes(signaturePrivateKey), { prehash: true });

  return {
    type: 'create-account-inbox',
    inboxId: inboxId,
    accountAddress,
    isPublic,
    authPolicy,
    encryptionPublicKey,
    signature: {
      hex: signature.toCompactHex(),
      recovery: signature.recovery,
    },
  } satisfies Messages.RequestCreateAccountInbox;
}

export async function createSpaceInboxCreationMessage({
  author,
  spaceId,
  isPublic,
  authPolicy,
  spaceSecretKey,
  previousEventHash,
}: CreateSpaceInboxParams): Promise<Messages.RequestCreateSpaceInboxEvent> {
  // Same as createAccountInboxMessage but with spaceId instead of accountAddress, and generating a keypair for the inbox
  const inboxId = bytesToHex(randomBytes(32));
  const { publicKey, privateKey } = cryptoBoxKeyPair();

  // encrypt the inbox secret key with the space secret key
  const encryptedInboxSecretKey = Messages.encryptMessage({
    message: privateKey,
    secretKey: hexToBytes(spaceSecretKey),
  });

  const spaceEvent = await Effect.runPromise(
    SpaceEvents.createInbox({
      spaceId,
      inboxId,
      encryptionPublicKey: bytesToHex(publicKey),
      secretKey: bytesToHex(encryptedInboxSecretKey),
      isPublic,
      authPolicy,
      author,
      previousEventHash,
    }),
  );

  return {
    type: 'create-space-inbox-event',
    spaceId,
    event: spaceEvent,
  } satisfies Messages.RequestCreateSpaceInboxEvent;
}
