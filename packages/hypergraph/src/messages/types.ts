import * as Schema from 'effect/Schema';

import { AcceptInvitationEvent, CreateInvitationEvent, CreateSpaceEvent, SpaceEvent } from '../space-events/index.js';

export const SignatureWithRecovery = Schema.Struct({
  hex: Schema.String,
  recovery: Schema.Number,
});

export const SignedUpdate = Schema.Struct({
  update: Schema.Uint8Array,
  accountId: Schema.String,
  signature: SignatureWithRecovery,
  ephemeralId: Schema.String,
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
  ephemeralId: Schema.String, // used to identify the confirmation message
  signature: SignatureWithRecovery,
});

export const RequestMessage = Schema.Union(
  RequestCreateSpaceEvent,
  RequestCreateInvitationEvent,
  RequestAcceptInvitationEvent,
  RequestSubscribeToSpace,
  RequestListSpaces,
  RequestListInvitations,
  RequestCreateUpdate,
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

export const ResponseSpace = Schema.Struct({
  type: Schema.Literal('space'),
  id: Schema.String,
  events: Schema.Array(SpaceEvent),
  keyBoxes: Schema.Array(KeyBoxWithKeyId),
  updates: Schema.optional(Updates),
});

export type ResponseSpace = Schema.Schema.Type<typeof ResponseSpace>;

export const ResponseUpdateConfirmed = Schema.Struct({
  type: Schema.Literal('update-confirmed'),
  ephemeralId: Schema.String,
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

export const ResponseMessage = Schema.Union(
  ResponseListSpaces,
  ResponseListInvitations,
  ResponseSpace,
  ResponseSpaceEvent,
  ResponseUpdateConfirmed,
  ResponseUpdatesNotification,
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

export const ResponseIdentityNotFoundError = Schema.Struct({
  accountId: Schema.String,
});

export type ResponseIdentityNotFoundError = Schema.Schema.Type<typeof ResponseIdentityNotFoundError>;

export const ResponseIdentityExistsError = Schema.Struct({
  accountId: Schema.String,
});

export type ResponseIdentityExistsError = Schema.Schema.Type<typeof ResponseIdentityExistsError>;
