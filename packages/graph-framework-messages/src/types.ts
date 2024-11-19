import * as Schema from 'effect/Schema';
import {
  AcceptInvitationEvent,
  CreateInvitationEvent,
  CreateSpaceEvent,
  SpaceEvent,
} from 'graph-framework-space-events';

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

export const RequestMessage = Schema.Union(
  RequestCreateSpaceEvent,
  RequestCreateInvitationEvent,
  RequestAcceptInvitationEvent,
  RequestSubscribeToSpace,
  RequestListSpaces,
  RequestListInvitations,
);

export type RequestMessage = Schema.Schema.Type<typeof RequestMessage>;

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
});

export type ResponseSpace = Schema.Schema.Type<typeof ResponseSpace>;

export const ResponseMessage = Schema.Union(
  ResponseListSpaces,
  ResponseListInvitations,
  ResponseSpace,
  ResponseSpaceEvent,
);

export type ResponseMessage = Schema.Schema.Type<typeof ResponseMessage>;
