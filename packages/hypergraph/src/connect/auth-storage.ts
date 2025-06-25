import { Schema } from 'effect';
import { deserialize, serialize } from '../messages/index.js';
import { type IdentityKeys, KeysSchema, type Storage } from './types.js';

export const getEnv = (): 'dev' | 'production' | 'local' => {
  return 'dev';
};

export const buildAccountAddressStorageKey = () => `hypergraph:${getEnv()}:id`;

export const buildKeysStorageKey = (walletAddress: string) =>
  walletAddress ? `hypergraph:${getEnv()}:keys:${walletAddress}` : '';

export const buildSessionTokenStorageKey = (walletAddress: string) =>
  walletAddress ? `hypergraph:${getEnv()}:session-token:${walletAddress}` : '';

export const loadKeys = (storage: Storage, walletAddress: string): IdentityKeys | null => {
  const accessKey = buildKeysStorageKey(walletAddress);
  const val = storage.getItem(accessKey);
  if (!val) {
    return null;
  }
  const deserialized = Schema.decodeUnknownSync(KeysSchema)(deserialize(val));
  return {
    encryptionPublicKey: deserialized.encryptionPublicKey,
    encryptionPrivateKey: deserialized.encryptionPrivateKey,
    signaturePublicKey: deserialized.signaturePublicKey,
    signaturePrivateKey: deserialized.signaturePrivateKey,
  };
};

export const storeKeys = (storage: Storage, walletAddress: string, keys: IdentityKeys) => {
  const keysMsg = serialize(Schema.encodeSync(KeysSchema)(keys));
  storage.setItem(buildKeysStorageKey(walletAddress), keysMsg);
};

export const wipeKeys = (storage: Storage, walletAddress: string) => {
  // This will clear the conversation cache + the private keys
  storage.removeItem(buildKeysStorageKey(walletAddress));
};

export const loadSyncServerSessionToken = (storage: Storage, address: string): string | null => {
  const key = buildSessionTokenStorageKey(address);
  const token = storage.getItem(key);
  return token;
};

export const storeSyncServerSessionToken = (storage: Storage, address: string, sessionToken: string) => {
  const key = buildSessionTokenStorageKey(address);
  storage.setItem(key, sessionToken);
};

export const wipeSyncServerSessionToken = (storage: Storage, walletAddress: string) => {
  storage.removeItem(buildSessionTokenStorageKey(walletAddress));
};

export const loadAccountAddress = (storage: Storage): string | null => {
  return storage.getItem(buildAccountAddressStorageKey());
};

export const storeAccountAddress = (storage: Storage, accountId: string) => {
  storage.setItem(buildAccountAddressStorageKey(), accountId);
};

export const wipeAccountAddress = (storage: Storage) => {
  storage.removeItem(buildAccountAddressStorageKey());
};

export const wipeAllAuthData = (storage: Storage) => {
  const accountAddress = loadAccountAddress(storage);
  wipeAccountAddress(storage);
  if (accountAddress) {
    wipeKeys(storage, accountAddress);
    wipeSyncServerSessionToken(storage, accountAddress);
  }
};
