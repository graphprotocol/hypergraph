import { store } from './../store.js';
import { wipeIdentity } from './auth-storage.js';
import type { Storage } from './types.js';

export function logout(storage: Storage) {
  wipeIdentity(storage);
  store.send({ type: 'resetAuth' });
}
