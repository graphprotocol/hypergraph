import * as Schema from 'effect/Schema';

import { InboxSenderAuthPolicy } from '../inboxes/types.js';
import {
  AcceptInvitationEvent,
  CreateInvitationEvent,
  CreateSpaceEvent,
  CreateSpaceInboxEvent,
  SpaceEvent,
} from '../space-events/index.js';
import { SignatureWithRecovery } from '../types.js';
export const SignedUpdate = Schema.Struct({
  update: Schema.Uint8Array,
  accountId: Schema.String,
  signature: SignatureWithRecovery,
  updateId: Schema.String,
});

export const Updates = Schema.Struct({
  updates: Schema.Array(SignedUpdate),
  firstUpdateClock: Schema.Number,
  lastUpdateClock: Schema.Number,
});

export type Updates = Schema.Schema.Type<typeof Updates>;

export const KeyBox = Schema.Struct({
  accountId: Schema.String,
  ciphertext: Schema.String,
  nonce: Schema.String,
  authorPublicKey: Schema.String,
});

export type KeyBox = Schema.Schema.Type<typeof KeyBox>;

export const KeyBoxWithKeyId = Schema.Struct({
  ...KeyBox.fields,
  id: Schema.String,
});

export type KeyBoxWithKeyId = Schema.Schema.Type<typeof KeyBoxWithKeyId>;

export const IdentityKeyBox = Schema.Struct({
  accountId: Schema.String,
  ciphertext: Schema.String,
  nonce: Schema.String,
});

export type IdentityKeyBox = Schema.Schema.Type<typeof IdentityKeyBox>;

export const RequestCreateSpaceEvent = Schema.Struct({
  type: Schema.Literal('create-space-event'),
  spaceId: Schema.String,
  event: CreateSpaceEvent,
  keyId: Schema.String,
  keyBox: KeyBox, // TODO change to KeyBoxWithKeyId and remove keyId
});

export type RequestCreateSpaceEvent = Schema.Schema.Type<typeof RequestCreateSpaceEvent>;

export const RequestCreateInvitationEvent = Schema.Struct({
  type: Schema.Literal('create-invitation-event'),
  spaceId: Schema.String,
  event: CreateInvitationEvent,
  keyBoxes: Schema.Array(KeyBoxWithKeyId),
});

export type RequestCreateInvitationEvent = Schema.Schema.Type<typeof RequestCreateInvitationEvent>;

export const RequestAcceptInvitationEvent = Schema.Struct({
  type: Schema.Literal('accept-invitation-event'),
  spaceId: Schema.String,
  event: AcceptInvitationEvent,
});

export type RequestAcceptInvitationEvent = Schema.Schema.Type<typeof RequestAcceptInvitationEvent>;

export const RequestSubscribeToSpace = Schema.Struct({
  type: Schema.Literal('subscribe-space'),
  id: Schema.String,
  lastKnownUpdateClock: Schema.optional(Schema.Number),
});

export type RequestSubscribeToSpace = Schema.Schema.Type<typeof RequestSubscribeToSpace>;

export const RequestListSpaces = Schema.Struct({
  type: Schema.Literal('list-spaces'),
});

export type RequestListSpaces = Schema.Schema.Type<typeof RequestListSpaces>;

export const RequestListInvitations = Schema.Struct({
  type: Schema.Literal('list-invitations'),
});

export type RequestListInvitations = Schema.Schema.Type<typeof RequestListInvitations>;

export const RequestCreateUpdate = Schema.Struct({
  type: Schema.Literal('create-update'),
  accountId: Schema.String,
  update: Schema.Uint8Array,
  spaceId: Schema.String,
  updateId: Schema.String, // used to identify the confirmation message
  signature: SignatureWithRecovery,
});

export const RequestCreateAccountInbox = Schema.Struct({
  type: Schema.Literal('create-account-inbox'),
  accountId: Schema.String,
  inboxId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  signature: SignatureWithRecovery,
});

export type RequestCreateAccountInbox = Schema.Schema.Type<typeof RequestCreateAccountInbox>;

export const RequestCreateSpaceInboxEvent = Schema.Struct({
  type: Schema.Literal('create-space-inbox-event'),
  spaceId: Schema.String,
  event: CreateSpaceInboxEvent,
});

export type RequestCreateSpaceInboxEvent = Schema.Schema.Type<typeof RequestCreateSpaceInboxEvent>;

export const RequestGetLatestSpaceInboxMessages = Schema.Struct({
  type: Schema.Literal('get-latest-space-inbox-messages'),
  spaceId: Schema.String,
  inboxId: Schema.String,
  since: Schema.Date,
});

export type RequestGetLatestSpaceInboxMessages = Schema.Schema.Type<typeof RequestGetLatestSpaceInboxMessages>;

export const RequestGetLatestAccountInboxMessages = Schema.Struct({
  type: Schema.Literal('get-latest-account-inbox-messages'),
  accountId: Schema.String,
  inboxId: Schema.String,
  since: Schema.Date,
});

export type RequestGetLatestAccountInboxMessages = Schema.Schema.Type<typeof RequestGetLatestAccountInboxMessages>;

export const RequestGetAccountInboxes = Schema.Struct({
  type: Schema.Literal('get-account-inboxes'),
});

export type RequestGetAccountInboxes = Schema.Schema.Type<typeof RequestGetAccountInboxes>;

export const RequestMessage = Schema.Union(
  RequestCreateSpaceEvent,
  RequestCreateInvitationEvent,
  RequestAcceptInvitationEvent,
  RequestSubscribeToSpace,
  RequestListSpaces,
  RequestListInvitations,
  RequestCreateUpdate,
  RequestCreateAccountInbox,
  RequestCreateSpaceInboxEvent,
  RequestGetLatestSpaceInboxMessages,
  RequestGetLatestAccountInboxMessages,
  RequestGetAccountInboxes,
);

export type RequestMessage = Schema.Schema.Type<typeof RequestMessage>;

export type RequestCreateUpdate = Schema.Schema.Type<typeof RequestCreateUpdate>;

export const RequestLoginNonce = Schema.Struct({
  accountId: Schema.String,
});

export type RequestLoginNonce = Schema.Schema.Type<typeof RequestLoginNonce>;

export const RequestLogin = Schema.Struct({
  accountId: Schema.String,
  message: Schema.String,
  signature: Schema.String,
});

export type RequestLogin = Schema.Schema.Type<typeof RequestLogin>;

export const RequestLoginWithSigningKey = Schema.Struct({
  accountId: Schema.String,
  message: Schema.String,
  publicKey: Schema.String,
  signature: Schema.String,
});

export type RequestLoginWithSigningKey = Schema.Schema.Type<typeof RequestLoginWithSigningKey>;

export const RequestCreateIdentity = Schema.Struct({
  keyBox: IdentityKeyBox,
  accountProof: Schema.String,
  keyProof: Schema.String,
  message: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  signature: Schema.String,
});

export type RequestCreateIdentity = Schema.Schema.Type<typeof RequestCreateIdentity>;

export const RequestCreateSpaceInboxMessage = Schema.Struct({
  ciphertext: Schema.String,
  signature: Schema.optional(SignatureWithRecovery),
  authorAccountId: Schema.optional(Schema.String),
});

export type RequestCreateSpaceInboxMessage = Schema.Schema.Type<typeof RequestCreateSpaceInboxMessage>;

export const RequestCreateAccountInboxMessage = Schema.Struct({
  ciphertext: Schema.String,
  signature: Schema.optional(SignatureWithRecovery),
  authorAccountId: Schema.optional(Schema.String),
});

export type RequestCreateAccountInboxMessage = Schema.Schema.Type<typeof RequestCreateAccountInboxMessage>;

export const ResponseListSpaces = Schema.Struct({
  type: Schema.Literal('list-spaces'),
  spaces: Schema.Array(
    Schema.Struct({
      id: Schema.String,
    }),
  ),
});

export type ResponseListSpaces = Schema.Schema.Type<typeof ResponseListSpaces>;

export const Invitation = Schema.Struct({
  id: Schema.String,
  previousEventHash: Schema.String,
  spaceId: Schema.String,
});

export type Invitation = Schema.Schema.Type<typeof Invitation>;

export const ResponseListInvitations = Schema.Struct({
  type: Schema.Literal('list-invitations'),
  invitations: Schema.Array(Invitation),
});

export type ResponseListInvitations = Schema.Schema.Type<typeof ResponseListInvitations>;

export const ResponseSpaceEvent = Schema.Struct({
  type: Schema.Literal('space-event'),
  spaceId: Schema.String,
  event: SpaceEvent,
});

export type ResponseSpaceEvent = Schema.Schema.Type<typeof ResponseSpaceEvent>;

export const InboxMessage = Schema.Struct({
  id: Schema.String,
  ciphertext: Schema.String,
  signature: Schema.optional(SignatureWithRecovery),
  authorAccountId: Schema.optional(Schema.String),
  createdAt: Schema.Date,
});

export type InboxMessage = Schema.Schema.Type<typeof InboxMessage>;

export const SpaceInbox = Schema.Struct({
  inboxId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  secretKey: Schema.String,
});

export type SpaceInbox = Schema.Schema.Type<typeof SpaceInbox>;

export const AccountInbox = Schema.Struct({
  accountId: Schema.String,
  inboxId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  signature: SignatureWithRecovery,
});

export type AccountInbox = Schema.Schema.Type<typeof AccountInbox>;

export const ResponseAccountInbox = Schema.Struct({
  type: Schema.Literal('account-inbox'),
  inbox: AccountInbox,
});

export type ResponseAccountInbox = Schema.Schema.Type<typeof ResponseAccountInbox>;

export const ResponseSpace = Schema.Struct({
  type: Schema.Literal('space'),
  id: Schema.String,
  events: Schema.Array(SpaceEvent),
  keyBoxes: Schema.Array(KeyBoxWithKeyId),
  updates: Schema.optional(Updates),
  inboxes: Schema.Array(SpaceInbox),
});

export type ResponseSpace = Schema.Schema.Type<typeof ResponseSpace>;

export const ResponseUpdateConfirmed = Schema.Struct({
  type: Schema.Literal('update-confirmed'),
  updateId: Schema.String,
  clock: Schema.Number,
  spaceId: Schema.String,
});

export type ResponseUpdateConfirmed = Schema.Schema.Type<typeof ResponseUpdateConfirmed>;

export const ResponseUpdatesNotification = Schema.Struct({
  type: Schema.Literal('updates-notification'),
  updates: Updates,
  spaceId: Schema.String,
});

export type ResponseUpdatesNotification = Schema.Schema.Type<typeof ResponseUpdatesNotification>;

export const ResponseSpaceInboxMessage = Schema.Struct({
  type: Schema.Literal('space-inbox-message'),
  spaceId: Schema.String,
  inboxId: Schema.String,
  message: InboxMessage,
});

export type ResponseSpaceInboxMessage = Schema.Schema.Type<typeof ResponseSpaceInboxMessage>;

export const ResponseSpaceInboxMessages = Schema.Struct({
  type: Schema.Literal('space-inbox-messages'),
  spaceId: Schema.String,
  inboxId: Schema.String,
  messages: Schema.Array(InboxMessage),
});

export type ResponseSpaceInboxMessages = Schema.Schema.Type<typeof ResponseSpaceInboxMessages>;

export const ResponseAccountInboxMessage = Schema.Struct({
  type: Schema.Literal('account-inbox-message'),
  accountId: Schema.String,
  inboxId: Schema.String,
  message: InboxMessage,
});

export type ResponseAccountInboxMessage = Schema.Schema.Type<typeof ResponseAccountInboxMessage>;

export const ResponseAccountInboxMessages = Schema.Struct({
  type: Schema.Literal('account-inbox-messages'),
  accountId: Schema.String,
  inboxId: Schema.String,
  messages: Schema.Array(InboxMessage),
});

export type ResponseAccountInboxMessages = Schema.Schema.Type<typeof ResponseAccountInboxMessages>;

export const ResponseAccountInboxes = Schema.Struct({
  type: Schema.Literal('account-inboxes'),
  inboxes: Schema.Array(AccountInbox),
});

export type ResponseAccountInboxes = Schema.Schema.Type<typeof ResponseAccountInboxes>;

export const ResponseMessage = Schema.Union(
  ResponseListSpaces,
  ResponseListInvitations,
  ResponseSpace,
  ResponseSpaceEvent,
  ResponseUpdateConfirmed,
  ResponseUpdatesNotification,
  ResponseAccountInbox,
  ResponseSpaceInboxMessage,
  ResponseSpaceInboxMessages,
  ResponseAccountInboxMessage,
  ResponseAccountInboxMessages,
  ResponseAccountInboxes,
);

export type ResponseMessage = Schema.Schema.Type<typeof ResponseMessage>;

export const ResponseLoginNonce = Schema.Struct({
  sessionNonce: Schema.String,
});

export type ResponseLoginNonce = Schema.Schema.Type<typeof ResponseLoginNonce>;

export const ResponseLogin = Schema.Struct({
  sessionToken: Schema.String,
});

export type ResponseLogin = Schema.Schema.Type<typeof ResponseLogin>;

export const ResponseCreateIdentity = Schema.Struct({
  sessionToken: Schema.String,
});

export type ResponseCreateIdentity = Schema.Schema.Type<typeof ResponseCreateIdentity>;

export const ResponseIdentityEncrypted = Schema.Struct({
  keyBox: IdentityKeyBox,
});

export type ResponseIdentityEncrypted = Schema.Schema.Type<typeof ResponseIdentityEncrypted>;

export const ResponseIdentity = Schema.Struct({
  accountId: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  accountProof: Schema.String,
  keyProof: Schema.String,
});

export type ResponseIdentity = Schema.Schema.Type<typeof ResponseIdentity>;

export const SpaceInboxPublic = Schema.Struct({
  inboxId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  creationEvent: CreateSpaceInboxEvent,
});

export type SpaceInboxPublic = Schema.Schema.Type<typeof SpaceInboxPublic>;

export const ResponseSpaceInboxPublic = Schema.Struct({
  inbox: SpaceInboxPublic,
});

export type ResponseSpaceInboxPublic = Schema.Schema.Type<typeof ResponseSpaceInboxPublic>;

export const ResponseListSpaceInboxesPublic = Schema.Struct({
  inboxes: Schema.Array(SpaceInboxPublic),
});

export type ResponseListSpaceInboxesPublic = Schema.Schema.Type<typeof ResponseListSpaceInboxesPublic>;

export const AccountInboxPublic = Schema.Struct({
  accountId: Schema.String,
  inboxId: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  encryptionPublicKey: Schema.String,
  signature: SignatureWithRecovery,
});

export type AccountInboxPublic = Schema.Schema.Type<typeof AccountInboxPublic>;

export const ResponseAccountInboxPublic = Schema.Struct({
  inbox: AccountInboxPublic,
});

export type ResponseAccountInboxPublic = Schema.Schema.Type<typeof ResponseAccountInboxPublic>;

export const ResponseListAccountInboxesPublic = Schema.Struct({
  inboxes: Schema.Array(AccountInboxPublic),
});

export type ResponseListAccountInboxesPublic = Schema.Schema.Type<typeof ResponseListAccountInboxesPublic>;

export const ResponseIdentityNotFoundError = Schema.Struct({
  accountId: Schema.String,
});

export type ResponseIdentityNotFoundError = Schema.Schema.Type<typeof ResponseIdentityNotFoundError>;

export const ResponseIdentityExistsError = Schema.Struct({
  accountId: Schema.String,
});

export type ResponseIdentityExistsError = Schema.Schema.Type<typeof ResponseIdentityExistsError>;
