import bs58check from 'bs58check';
import { parse as parseUuid, stringify as stringifyUuid } from 'uuid';
import { normalizeGeoId, toUuid } from './geo-id.js';

/**
 * Converts a Geo ID (UUID without dashes) into Base58Check
 */
export function idToAutomergeId(id: string) {
  // `id` parsing expects canonical formatting; accept dashless IDs too.
  const payload = parseUuid(toUuid(id));
  return bs58check.encode(payload);
}

/**
 * Converts a Base58Check-encoded UUID back to UUID
 */
export function automergeIdToId(base58CheckUuid: string) {
  const versionedPayload = bs58check.decode(base58CheckUuid);
  // Return dashless IDs to align with GRC-20 / API conventions.
  return normalizeGeoId(stringifyUuid(versionedPayload));
}
