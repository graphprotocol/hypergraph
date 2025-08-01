import { Messages, SignatureWithRecovery } from '@graphprotocol/hypergraph';
import { Schema } from 'effect';

/**
 * Re-export existing schemas from Hypergraph Messages
 */
export { SignatureWithRecovery };
export const KeyBox = Messages.KeyBox;
export const KeyBoxWithKeyId = Messages.KeyBoxWithKeyId;
export const IdentityKeyBox = Messages.IdentityKeyBox;
export const SignedUpdate = Messages.SignedUpdate;
export const Updates = Messages.Updates;
export const InboxMessage = Messages.InboxMessage;

/**
 * Inbox auth policy (from Hypergraph)
 */
export const InboxSenderAuthPolicy = Schema.Literal('requires_auth', 'anonymous', 'optional_auth');

/**
 * Database entity schemas (Prisma-based)
 */
export const Account = Schema.Struct({
  address: Schema.String,
  connectAddress: Schema.String,
  connectCiphertext: Schema.String,
  connectNonce: Schema.String,
  connectSignaturePublicKey: Schema.String,
  connectEncryptionPublicKey: Schema.String,
  connectAccountProof: Schema.String,
  connectKeyProof: Schema.String,
  connectSignerAddress: Schema.String,
});

export const AppIdentity = Schema.Struct({
  address: Schema.String,
  ciphertext: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  accountProof: Schema.String,
  keyProof: Schema.String,
  accountAddress: Schema.String,
  appId: Schema.String,
  sessionToken: Schema.String,
  sessionTokenExpires: Schema.DateFromSelf,
});

export const Space = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  infoContent: Schema.Uint8Array,
  infoAuthorAddress: Schema.String,
  infoSignatureHex: Schema.String,
  infoSignatureRecovery: Schema.Number,
});

export const SpaceEvent = Schema.Struct({
  id: Schema.String,
  event: Schema.String,
  state: Schema.String,
  counter: Schema.Number,
  spaceId: Schema.String,
  createdAt: Schema.DateFromSelf,
});

export const SpaceKey = Schema.Struct({
  id: Schema.String,
  spaceId: Schema.String,
  createdAt: Schema.DateFromSelf,
});

export const SpaceKeyBox = Schema.Struct({
  id: Schema.String,
  spaceKeyId: Schema.String,
  ciphertext: Schema.String,
  nonce: Schema.String,
  authorPublicKey: Schema.String,
  accountAddress: Schema.String,
  appIdentityAddress: Schema.optional(Schema.String),
  createdAt: Schema.DateFromSelf,
});

export const Update = Schema.Struct({
  spaceId: Schema.String,
  clock: Schema.Number,
  content: Schema.Uint8Array,
  accountAddress: Schema.String,
  signatureHex: Schema.String,
  signatureRecovery: Schema.Number,
  updateId: Schema.String,
});

export const SpaceInbox = Schema.Struct({
  id: Schema.String,
  spaceId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  encryptedSecretKey: Schema.String,
  spaceEventId: Schema.String,
  createdAt: Schema.DateFromSelf,
});

export const SpaceInboxMessage = Schema.Struct({
  id: Schema.String,
  spaceInboxId: Schema.String,
  ciphertext: Schema.String,
  signatureHex: Schema.optional(Schema.String),
  signatureRecovery: Schema.optional(Schema.Number),
  authorAccountAddress: Schema.optional(Schema.String),
  createdAt: Schema.DateFromSelf,
});

export const AccountInbox = Schema.Struct({
  id: Schema.String,
  accountAddress: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  signatureHex: Schema.String,
  signatureRecovery: Schema.Number,
  createdAt: Schema.DateFromSelf,
});

export const AccountInboxMessage = Schema.Struct({
  id: Schema.String,
  accountInboxId: Schema.String,
  ciphertext: Schema.String,
  signatureHex: Schema.optional(Schema.String),
  signatureRecovery: Schema.optional(Schema.Number),
  authorAccountAddress: Schema.optional(Schema.String),
  createdAt: Schema.DateFromSelf,
});

export const Invitation = Schema.Struct({
  id: Schema.String,
  spaceId: Schema.String,
  accountAddress: Schema.String,
  inviteeAccountAddress: Schema.String,
  createdAt: Schema.DateFromSelf,
});

export const InvitationTargetApp = Schema.Struct({
  id: Schema.String,
  invitationId: Schema.String,
});

/**
 * API response schemas
 */
export const SpaceInboxPublic = Schema.Struct({
  id: Schema.String,
  spaceId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
});

export const AccountInboxPublic = Schema.Struct({
  id: Schema.String,
  accountAddress: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
});

export const PublicIdentity = Schema.Struct({
  accountAddress: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  accountProof: Schema.String,
  keyProof: Schema.String,
  appId: Schema.optional(Schema.String),
});
