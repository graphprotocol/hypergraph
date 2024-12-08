import bs58check from 'bs58check';

import { decodeBase58, encodeBase58 } from './internal/base58Utils.js';

/**
 * Converts a raw Base58-encoded UUID into Base58Check
 */
export function idToAutomergeId(rawBase58Uuid: string, _versionByte = 0x00) {
  const payload = decodeBase58(rawBase58Uuid);
  return bs58check.encode(payload);
}

/**
 * Converts a Base58Check-encoded UUID back to raw Base58
 */
export function automergeIdToId(base58CheckUuid: string) {
  const versionedPayload = bs58check.decode(base58CheckUuid);
  return encodeBase58(versionedPayload);
}
