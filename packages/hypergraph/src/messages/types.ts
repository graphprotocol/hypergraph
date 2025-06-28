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
  accountAddress: Schema.String,
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
  accountAddress: Schema.String,
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
  signer: Schema.String,
  accountAddress: Schema.String,
  ciphertext: Schema.String,
  nonce: Schema.String,
});

export type IdentityKeyBox = Schema.Schema.Type<typeof IdentityKeyBox>;

export const RequestCreateSpaceEvent = Schema.Struct({
  type: Schema.Literal('create-space-event'),
  spaceId: Schema.String,
  event: CreateSpaceEvent,
  keyBox: KeyBoxWithKeyId,
  name: Schema.String,
});

export type RequestCreateSpaceEvent = Schema.Schema.Type<typeof RequestCreateSpaceEvent>;

export const RequestConnectCreateSpaceEvent = Schema.Struct({
  type: Schema.Literal('connect-create-space-event'),
  accountAddress: Schema.String,
  spaceId: Schema.String,
  event: CreateSpaceEvent,
  keyBox: KeyBoxWithKeyId,
  infoContent: Schema.String,
  infoSignature: SignatureWithRecovery,
  name: Schema.String,
});

export type RequestConnectCreateSpaceEvent = Schema.Schema.Type<typeof RequestConnectCreateSpaceEvent>;

export const RequestCreateInvitationEvent = Schema.Struct({
  type: Schema.Literal('create-invitation-event'),
  spaceId: Schema.String,
  event: CreateInvitationEvent,
  keyBoxes: Schema.Array(KeyBoxWithKeyId),
});

export const RequestConnectAddAppIdentityToSpaces = Schema.Struct({
  type: Schema.Literal('connect-add-app-identity-to-spaces'),
  appIdentityAddress: Schema.String,
  accountAddress: Schema.String,
  spacesInput: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      keyBoxes: Schema.Array(KeyBoxWithKeyId),
    }),
  ),
});

export type RequestConnectAddAppIdentityToSpaces = Schema.Schema.Type<typeof RequestConnectAddAppIdentityToSpaces>;

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
  accountAddress: Schema.String,
  update: Schema.Uint8Array,
  spaceId: Schema.String,
  updateId: Schema.String, // used to identify the confirmation message
  signature: SignatureWithRecovery,
});

export const RequestCreateAccountInbox = Schema.Struct({
  type: Schema.Literal('create-account-inbox'),
  accountAddress: Schema.String,
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
  accountAddress: Schema.String,
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
  accountAddress: Schema.String,
});

export type RequestLoginNonce = Schema.Schema.Type<typeof RequestLoginNonce>;

export const RequestLogin = Schema.Struct({
  accountAddress: Schema.String,
  message: Schema.String,
  signature: Schema.String,
});

export type RequestLogin = Schema.Schema.Type<typeof RequestLogin>;

export const RequestLoginWithSigningKey = Schema.Struct({
  accountAddress: Schema.String,
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

export const RequestConnectCreateIdentity = Schema.Struct({
  keyBox: IdentityKeyBox,
  accountProof: Schema.String,
  keyProof: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
});

export type RequestConnectCreateIdentity = Schema.Schema.Type<typeof RequestConnectCreateIdentity>;

export const RequestConnectCreateAppIdentity = Schema.Struct({
  appId: Schema.String,
  address: Schema.String,
  accountAddress: Schema.String,
  ciphertext: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  accountProof: Schema.String,
  keyProof: Schema.String,
});

export type RequestConnectCreateAppIdentity = Schema.Schema.Type<typeof RequestConnectCreateAppIdentity>;

export const ResponseConnectCreateIdentity = Schema.Struct({
  success: Schema.Boolean,
});

export type ResponseConnectCreateIdentity = Schema.Schema.Type<typeof ResponseConnectCreateIdentity>;

export const RequestCreateSpaceInboxMessage = Schema.Struct({
  ciphertext: Schema.String,
  signature: Schema.optional(SignatureWithRecovery),
  authorAccountAddress: Schema.optional(Schema.String),
});

export type RequestCreateSpaceInboxMessage = Schema.Schema.Type<typeof RequestCreateSpaceInboxMessage>;

export const RequestCreateAccountInboxMessage = Schema.Struct({
  ciphertext: Schema.String,
  signature: Schema.optional(SignatureWithRecovery),
  authorAccountAddress: Schema.optional(Schema.String),
});

export type RequestCreateAccountInboxMessage = Schema.Schema.Type<typeof RequestCreateAccountInboxMessage>;

export const ResponseListSpaces = Schema.Struct({
  type: Schema.Literal('list-spaces'),
  spaces: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      name: Schema.String,
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
  authorAccountAddress: Schema.optional(Schema.String),
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
  accountAddress: Schema.String,
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
  name: Schema.String,
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
  accountAddress: Schema.String,
  inboxId: Schema.String,
  message: InboxMessage,
});

export type ResponseAccountInboxMessage = Schema.Schema.Type<typeof ResponseAccountInboxMessage>;

export const ResponseAccountInboxMessages = Schema.Struct({
  type: Schema.Literal('account-inbox-messages'),
  accountAddress: Schema.String,
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

export const ResponseIdentityEncrypted = Schema.Struct({
  keyBox: IdentityKeyBox,
});

export type ResponseIdentityEncrypted = Schema.Schema.Type<typeof ResponseIdentityEncrypted>;

export const ResponseIdentity = Schema.Struct({
  accountAddress: Schema.String,
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  accountProof: Schema.String,
  keyProof: Schema.String,
  appId: Schema.optional(Schema.String),
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
  accountAddress: Schema.String,
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
  accountAddress: Schema.String,
});

export type ResponseIdentityNotFoundError = Schema.Schema.Type<typeof ResponseIdentityNotFoundError>;

export const ResponseIdentityExistsError = Schema.Struct({
  accountAddress: Schema.String,
});

export type ResponseIdentityExistsError = Schema.Schema.Type<typeof ResponseIdentityExistsError>;
