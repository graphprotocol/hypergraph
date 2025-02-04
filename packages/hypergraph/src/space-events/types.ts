import type { ParseError } from 'effect/ParseResult';
import * as Schema from 'effect/Schema';
import { InvalidIdentityError } from '../identity/types.js';
import { SignatureWithRecovery } from '../types.js';

export const EventAuthor = Schema.Struct({
  accountId: Schema.String,
  signature: SignatureWithRecovery,
});

export type EventAuthor = Schema.Schema.Type<typeof Author>;

export const SpaceMember = Schema.Struct({
  accountId: Schema.String,
  role: Schema.Union(Schema.Literal('admin'), Schema.Literal('member')),
});

export type SpaceMember = Schema.Schema.Type<typeof SpaceMember>;

export const SpaceInvitation = Schema.Struct({
  inviteeAccountId: Schema.String,
});

export type SpaceInvitation = Schema.Schema.Type<typeof SpaceInvitation>;

export const SpaceState = Schema.Struct({
  id: Schema.String,
  invitations: Schema.Record({ key: Schema.String, value: SpaceInvitation }),
  members: Schema.Record({ key: Schema.String, value: SpaceMember }),
  removedMembers: Schema.Record({ key: Schema.String, value: SpaceMember }),
  lastEventHash: Schema.String,
});

export type SpaceState = Schema.Schema.Type<typeof SpaceState>;

export const CreateSpaceEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('create-space'),
    id: Schema.String,
    creatorAccountId: Schema.String,
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
    inviteeAccountId: Schema.String,
    previousEventHash: Schema.String,
  }),
  author: EventAuthor,
});

export type CreateInvitationEvent = Schema.Schema.Type<typeof CreateInvitationEvent>;

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
);

export type SpaceEvent = Schema.Schema.Type<typeof SpaceEvent>;

export const Author = Schema.Struct({
  accountId: Schema.String,
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
