import type { Hex } from '@graph-framework/utils';
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

export type Keys = {
  encryptionPublicKey: Hex;
  encryptionPrivateKey: Hex;
  signaturePublicKey: Hex;
  signaturePrivateKey: Hex;
};

export const KeysSchema = Schema.Struct({
  encryptionPublicKey: Schema.String,
  encryptionPrivateKey: Schema.String,
  signaturePublicKey: Schema.String,
  signaturePrivateKey: Schema.String,
});

export type KeysSchema = Schema.Schema.Type<typeof KeysSchema>;

export type Identity = {
  accountId: string;
  encryptionPublicKey: Hex;
  encryptionPrivateKey: Hex;
  signaturePublicKey: Hex;
  signaturePrivateKey: Hex;
};
