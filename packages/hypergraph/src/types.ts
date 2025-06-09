import type { Id as Grc20Id } from '@graphprotocol/grc-20';
import * as Data from 'effect/Data';
import * as Schema from 'effect/Schema';

export const SignatureWithRecovery = Schema.Struct({
  hex: Schema.String,
  recovery: Schema.Number,
});

export type SignatureWithRecovery = Schema.Schema.Type<typeof SignatureWithRecovery>;

export const ConnectAuthPayload = Schema.Struct({
  expiry: Schema.Number,
  encryptionPublicKey: Schema.String,
  appId: Schema.String,
});

export type ConnectAuthPayload = Schema.Schema.Type<typeof ConnectAuthPayload>;

export const ConnectCallbackResult = Schema.Struct({
  appIdentityAddress: Schema.String,
  appIdentityAddressPrivateKey: Schema.String,
  accountAddress: Schema.String,
  permissionId: Schema.String,
  signaturePublicKey: Schema.String,
  signaturePrivateKey: Schema.String,
  encryptionPublicKey: Schema.String,
  encryptionPrivateKey: Schema.String,
  sessionToken: Schema.String,
  sessionTokenExpires: Schema.Date,
  spaces: Schema.Array(Schema.Struct({ id: Schema.String })),
});

export type ConnectCallbackResult = Schema.Schema.Type<typeof ConnectCallbackResult>;

export const ConnectCallbackDecryptedData = Schema.Struct({
  ...ConnectCallbackResult.fields,
  sessionTokenExpires: Schema.Number,
  expiry: Schema.Number,
});

export type ConnectCallbackDecryptedData = Schema.Schema.Type<typeof ConnectCallbackDecryptedData>;

export class FailedToParseConnectAuthUrl extends Data.TaggedError('FailedToParseConnectAuthUrl')<{
  message: string;
}> {}

export class FailedToParseAuthCallbackUrl extends Data.TaggedError('FailedToParseAuthCallbackUrl')<{
  message: string;
}> {}

export type MappingEntry = {
  typeIds: Grc20Id.Id[];
  properties?: {
    [key: string]: Grc20Id.Id;
  };
  relations?: {
    [key: string]: Grc20Id.Id;
  };
};

export type Mapping = {
  [key: string]: MappingEntry;
};
