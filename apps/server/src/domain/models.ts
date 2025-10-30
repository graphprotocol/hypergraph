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
export class Account extends Schema.Class<Account>('Account')({
  address: Schema.String,
  connectAddress: Schema.String,
  connectCiphertext: Schema.String,
  connectNonce: Schema.String,
  connectSignaturePublicKey: Schema.String,
  connectEncryptionPublicKey: Schema.String,
  connectAccountProof: Schema.String,
  connectKeyProof: Schema.String,
  connectSignerAddress: Schema.String,
}) {}

export class AppIdentity extends Schema.Class<AppIdentity>('AppIdentity')({
  address: Schema.String,
  ciphertext: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  accountProof: Schema.String,
  keyProof: Schema.String,
  accountAddress: Schema.String,
  appId: Schema.String,
  sessionToken: Schema.String.pipe(Schema.NullOr),
  sessionTokenExpires: Schema.Date.pipe(Schema.NullOr),
}) {}

export class Space extends Schema.Class<Space>('Space')({
  id: Schema.String,
  name: Schema.String,
  infoContent: Schema.Uint8Array,
  infoAuthorAddress: Schema.String,
  infoSignatureHex: Schema.String,
  infoSignatureRecovery: Schema.Number,
}) {}

export class SpaceEvent extends Schema.Class<SpaceEvent>('SpaceEvent')({
  id: Schema.String,
  event: Schema.String,
  state: Schema.String,
  counter: Schema.Number,
  spaceId: Schema.String,
  createdAt: Schema.DateFromSelf,
}) {}

export class SpaceKey extends Schema.Class<SpaceKey>('SpaceKey')({
  id: Schema.String,
  spaceId: Schema.String,
  createdAt: Schema.DateFromSelf,
}) {}

export class SpaceKeyBox extends Schema.Class<SpaceKeyBox>('SpaceKeyBox')({
  id: Schema.String,
  spaceKeyId: Schema.String,
  ciphertext: Schema.String,
  nonce: Schema.String,
  authorPublicKey: Schema.String,
  accountAddress: Schema.String,
  appIdentityAddress: Schema.optional(Schema.String),
  createdAt: Schema.DateFromSelf,
}) {}

export class Update extends Schema.Class<Update>('Update')({
  spaceId: Schema.String,
  clock: Schema.Number,
  content: Schema.Uint8Array,
  accountAddress: Schema.String,
  signatureHex: Schema.String,
  signatureRecovery: Schema.Number,
  updateId: Schema.String,
}) {}

export class SpaceInbox extends Schema.Class<SpaceInbox>('SpaceInbox')({
  id: Schema.String,
  spaceId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  encryptedSecretKey: Schema.String,
  spaceEventId: Schema.String,
  createdAt: Schema.DateFromSelf,
}) {}

export class SpaceInboxMessage extends Schema.Class<SpaceInboxMessage>('SpaceInboxMessage')({
  id: Schema.String,
  spaceInboxId: Schema.String,
  ciphertext: Schema.String,
  signatureHex: Schema.optional(Schema.String),
  signatureRecovery: Schema.optional(Schema.Number),
  authorAccountAddress: Schema.optional(Schema.String),
  createdAt: Schema.DateFromSelf,
}) {}

export class AccountInbox extends Schema.Class<AccountInbox>('AccountInbox')({
  id: Schema.String,
  accountAddress: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  signatureHex: Schema.String,
  signatureRecovery: Schema.Number,
  createdAt: Schema.DateFromSelf,
}) {}

export class AccountInboxMessage extends Schema.Class<AccountInboxMessage>('AccountInboxMessage')({
  id: Schema.String,
  accountInboxId: Schema.String,
  ciphertext: Schema.String,
  signatureHex: Schema.optional(Schema.String),
  signatureRecovery: Schema.optional(Schema.Number),
  authorAccountAddress: Schema.optional(Schema.String),
  createdAt: Schema.DateFromSelf,
}) {}

export class Invitation extends Schema.Class<Invitation>('Invitation')({
  id: Schema.String,
  spaceId: Schema.String,
  accountAddress: Schema.String,
  inviteeAccountAddress: Schema.String,
  createdAt: Schema.DateFromSelf,
}) {}

export class InvitationTargetApp extends Schema.Class<InvitationTargetApp>('InvitationTargetApp')({
  id: Schema.String,
  invitationId: Schema.String,
}) {}

/**
 * API response schemas
 */
export class SpaceInboxPublic extends Schema.Class<SpaceInboxPublic>('SpaceInboxPublic')({
  id: Schema.String,
  spaceId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
}) {}

export class AccountInboxPublic extends Schema.Class<AccountInboxPublic>('AccountInboxPublic')({
  id: Schema.String,
  accountAddress: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
}) {}

export class PublicIdentity extends Schema.Class<PublicIdentity>('PublicIdentity')({
  accountAddress: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  accountProof: Schema.String,
  keyProof: Schema.String,
  appId: Schema.optional(Schema.String),
}) {}
