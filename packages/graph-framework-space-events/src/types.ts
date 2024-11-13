import * as Schema from 'effect/Schema';

export const SpaceMember = Schema.Struct({
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
  role: Schema.Union(Schema.Literal('admin'), Schema.Literal('member')),
});

export type SpaceMember = Schema.Schema.Type<typeof SpaceMember>;

export const SpaceInvitation = Schema.Struct({
  signaturePublicKey: Schema.String,
  encryptionPublicKey: Schema.String,
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
    creatorSignaturePublicKey: Schema.String,
    creatorEncryptionPublicKey: Schema.String,
  }),
  author: Schema.Struct({
    publicKey: Schema.String,
    signature: Schema.String,
  }),
});

export type CreateSpaceEvent = Schema.Schema.Type<typeof CreateSpaceEvent>;

export const DeleteSpaceEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('delete-space'),
    id: Schema.String,
    previousEventHash: Schema.String,
  }),
  author: Schema.Struct({
    publicKey: Schema.String,
    signature: Schema.String,
  }),
});

export type DeleteSpaceEvent = Schema.Schema.Type<typeof DeleteSpaceEvent>;

export const CreateInvitationEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('create-invitation'),
    id: Schema.String,
    ciphertext: Schema.String,
    nonce: Schema.String,
    signaturePublicKey: Schema.String,
    encryptionPublicKey: Schema.String,
    previousEventHash: Schema.String,
  }),
  author: Schema.Struct({
    publicKey: Schema.String,
    signature: Schema.String,
  }),
});

export type CreateInvitationEvent = Schema.Schema.Type<typeof CreateInvitationEvent>;

export const SpaceEvent = Schema.Union(CreateSpaceEvent, DeleteSpaceEvent, CreateInvitationEvent);

export type SpaceEvent = Schema.Schema.Type<typeof SpaceEvent>;

export const Author = Schema.Struct({
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
