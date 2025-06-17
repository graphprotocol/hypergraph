import bs58check from 'bs58check';
import { parse as parseUuid, stringify as stringifyUuid } from 'uuid';

/**
 * Converts a UUID into Base58Check
 */
export function idToAutomergeId(uuid: string, _versionByte = 0x00) {
  const payload = parseUuid(uuid);
  return bs58check.encode(payload);
}

/**
 * Converts a Base58Check-encoded UUID back to UUID
 */
export function automergeIdToId(base58CheckUuid: string) {
  const versionedPayload = bs58check.decode(base58CheckUuid);
  return stringifyUuid(versionedPayload);
}
