import type { ParseError } from 'effect/ParseResult';
import * as Schema from 'effect/Schema';
import type { InvalidIdentityError } from '../identity/types.js';
import { InboxSenderAuthPolicy } from '../inboxes/types.js';
import { SignatureWithRecovery } from '../types.js';

export const EventAuthor = Schema.Struct({
  accountAddress: Schema.String,
  signature: SignatureWithRecovery,
});

export type EventAuthor = Schema.Schema.Type<typeof Author>;

export const SpaceMember = Schema.Struct({
  accountAddress: Schema.String,
  role: Schema.Union(Schema.Literal('admin'), Schema.Literal('member')),
});

export type SpaceMember = Schema.Schema.Type<typeof SpaceMember>;

export const SpaceInvitation = Schema.Struct({
  inviteeAccountAddress: Schema.String,
});

export type SpaceInvitation = Schema.Schema.Type<typeof SpaceInvitation>;

export const SpaceInbox = Schema.Struct({
  inboxId: Schema.String,
  encryptionPublicKey: Schema.String,
  isPublic: Schema.Boolean,
  authPolicy: InboxSenderAuthPolicy,
  secretKey: Schema.String,
});

export type SpaceInbox = Schema.Schema.Type<typeof SpaceInbox>;

export const SpaceState = Schema.Struct({
  id: Schema.String,
  invitations: Schema.Record({ key: Schema.String, value: SpaceInvitation }),
  members: Schema.Record({ key: Schema.String, value: SpaceMember }),
  removedMembers: Schema.Record({ key: Schema.String, value: SpaceMember }),
  inboxes: Schema.Record({ key: Schema.String, value: SpaceInbox }),
  lastEventHash: Schema.String,
});

export type SpaceState = Schema.Schema.Type<typeof SpaceState>;

export const CreateSpaceEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('create-space'),
    id: Schema.String,
    creatorAccountAddress: Schema.String,
  }),
  author: EventAuthor,
});

export type CreateSpaceEvent = Schema.Schema.Type<typeof CreateSpaceEvent>;

export const DeleteSpaceEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('delete-space'),
    id: Schema.String,
    previousEventHash: Schema.String,
  }),
  author: EventAuthor,
});

export type DeleteSpaceEvent = Schema.Schema.Type<typeof DeleteSpaceEvent>;

export const CreateInvitationEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('create-invitation'),
    id: Schema.String,
    inviteeAccountAddress: Schema.String,
    previousEventHash: Schema.String,
  }),
  author: EventAuthor,
});

export type CreateInvitationEvent = Schema.Schema.Type<typeof CreateInvitationEvent>;

export const CreateSpaceInboxEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('create-space-inbox'),
    id: Schema.String,
    spaceId: Schema.String,
    inboxId: Schema.String,
    encryptionPublicKey: Schema.String,
    secretKey: Schema.String,
    isPublic: Schema.Boolean,
    authPolicy: InboxSenderAuthPolicy,
    previousEventHash: Schema.String,
  }),
  author: EventAuthor,
});

export type CreateSpaceInboxEvent = Schema.Schema.Type<typeof CreateSpaceInboxEvent>;

export const AcceptInvitationEvent = Schema.Struct({
  transaction: Schema.Struct({
    id: Schema.String,
    type: Schema.Literal('accept-invitation'),
    previousEventHash: Schema.String,
  }),
  author: EventAuthor,
});

export type AcceptInvitationEvent = Schema.Schema.Type<typeof AcceptInvitationEvent>;

export const SpaceEvent = Schema.Union(
  CreateSpaceEvent,
  DeleteSpaceEvent,
  CreateInvitationEvent,
  AcceptInvitationEvent,
  CreateSpaceInboxEvent,
);

export type SpaceEvent = Schema.Schema.Type<typeof SpaceEvent>;

export const Author = Schema.Struct({
  accountAddress: Schema.String,
  signaturePublicKey: Schema.String,
  signaturePrivateKey: Schema.String,
  encryptionPublicKey: Schema.String,
});

export type Author = Schema.Schema.Type<typeof Author>;

export class VerifySignatureError {
  readonly _tag = 'VerifySignatureError';
}

export class InvalidEventError {
  readonly _tag = 'InvalidEventError';
}

export type ApplyError = ParseError | VerifySignatureError | InvalidEventError | InvalidIdentityError;
