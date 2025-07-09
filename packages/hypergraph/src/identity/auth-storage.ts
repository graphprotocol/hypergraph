import type { PrivateAppIdentity } from '../connect/types.js';
import type { Storage } from './types.js';

export const storeIdentity = (storage: Storage, identity: PrivateAppIdentity) => {
  storage.setItem('hypergraph:app-identity-address', identity.address);
  storage.setItem('hypergraph:app-identity-address-private-key', identity.addressPrivateKey);
  storage.setItem('hypergraph:app-identity-account-address', identity.accountAddress);
  storage.setItem('hypergraph:signature-public-key', identity.signaturePublicKey);
  storage.setItem('hypergraph:signature-private-key', identity.signaturePrivateKey);
  storage.setItem('hypergraph:encryption-public-key', identity.encryptionPublicKey);
  storage.setItem('hypergraph:encryption-private-key', identity.encryptionPrivateKey);
  storage.setItem('hypergraph:session-token', identity.sessionToken);
  storage.setItem('hypergraph:session-token-expires', identity.sessionTokenExpires.toISOString());
  storage.setItem('hypergraph:permission-id', identity.permissionId);
};

export const loadIdentity = (storage: Storage): PrivateAppIdentity | null => {
  const address = storage.getItem('hypergraph:app-identity-address');
  const addressPrivateKey = storage.getItem('hypergraph:app-identity-address-private-key');
  const accountAddress = storage.getItem('hypergraph:app-identity-account-address');
  const signaturePublicKey = storage.getItem('hypergraph:signature-public-key');
  const signaturePrivateKey = storage.getItem('hypergraph:signature-private-key');
  const encryptionPublicKey = storage.getItem('hypergraph:encryption-public-key');
  const encryptionPrivateKey = storage.getItem('hypergraph:encryption-private-key');
  const sessionToken = storage.getItem('hypergraph:session-token');
  const sessionTokenExpires = storage.getItem('hypergraph:session-token-expires');
  const permissionId = storage.getItem('hypergraph:permission-id');
  if (
    !address ||
    !addressPrivateKey ||
    !accountAddress ||
    !signaturePublicKey ||
    !signaturePrivateKey ||
    !encryptionPublicKey ||
    !encryptionPrivateKey ||
    !sessionToken ||
    !sessionTokenExpires ||
    !permissionId
  ) {
    return null;
  }
  return {
    address,
    addressPrivateKey,
    accountAddress,
    signaturePublicKey,
    signaturePrivateKey,
    encryptionPublicKey,
    encryptionPrivateKey,
    sessionToken,
    sessionTokenExpires: new Date(sessionTokenExpires),
    permissionId,
  };
};

export const wipeIdentity = (storage: Storage) => {
  storage.removeItem('hypergraph:app-identity-address');
  storage.removeItem('hypergraph:app-identity-address-private-key');
  storage.removeItem('hypergraph:app-identity-account-address');
  storage.removeItem('hypergraph:signature-public-key');
  storage.removeItem('hypergraph:signature-private-key');
  storage.removeItem('hypergraph:encryption-public-key');
  storage.removeItem('hypergraph:encryption-private-key');
  storage.removeItem('hypergraph:session-token');
  storage.removeItem('hypergraph:session-token-expires');
  storage.removeItem('hypergraph:permission-id');
};
