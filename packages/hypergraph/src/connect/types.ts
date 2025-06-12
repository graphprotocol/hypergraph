import { Schema } from 'effect';

export type Storage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type SignMessage = (message: string) => Promise<string> | string;
export type GetAddress = () => Promise<string> | string;
export type Signer = {
  getAddress: GetAddress;
  signMessage: SignMessage;
};

export type IdentityKeys = {
  encryptionPublicKey: string;
  encryptionPrivateKey: string;
  signaturePublicKey: string;
  signaturePrivateKey: string;
};

export const KeysSchema = Schema.Struct({
  encryptionPublicKey: Schema.String,
  encryptionPrivateKey: Schema.String,
  signaturePublicKey: Schema.String,
  signaturePrivateKey: Schema.String,
});

export type KeysSchema = Schema.Schema.Type<typeof KeysSchema>;

export type Identity = IdentityKeys & {
  accountAddress: string;
};

export type PublicAppIdentity = {
  address: string;
  encryptionPublicKey: string;
  signaturePublicKey: string;
};

export type PrivateAppIdentity = IdentityKeys & {
  address: string;
  addressPrivateKey: string;
  sessionToken: string;
  sessionTokenExpires: Date;
};

export class InvalidIdentityError {
  readonly _tag = 'InvalidIdentityError';
}
