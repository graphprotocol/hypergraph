import { store } from './../store.js';
import { wipeIdentity, wipePrivyIdentity } from './auth-storage.js';
import type { Storage } from './types.js';

export function logout(storage: Storage) {
  wipeIdentity(storage);
  wipePrivyIdentity(storage);
  store.send({ type: 'resetAuth' });
}
