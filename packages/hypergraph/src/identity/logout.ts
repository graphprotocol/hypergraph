import { store } from './../store.js';
import { wipeAccountId, wipeKeys, wipeSyncServerSessionToken } from './auth-storage.js';
import type { Storage } from './types.js';

export function logout(accountId: string | null, storage: Storage) {
  wipeAccountId(storage);
  if (!accountId) {
    return;
  }
  wipeKeys(storage, accountId);
  wipeSyncServerSessionToken(storage, accountId);
  store.send({ type: 'resetAuth' });
}
