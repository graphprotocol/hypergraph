import { Schema } from 'effect';

/**
 * Hypergraph Geo IDs are UUIDs without dashes (32 hex chars).
 *
 * Since older code and tooling may still provide UUIDs with dashes, we accept both
 * and normalize to the dashless format.
 */
export type GeoId = string;

const UUID_WITH_DASHES_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_WITHOUT_DASHES_REGEX = /^[0-9a-f]{32}$/i;

export function normalizeGeoId(id: string): GeoId {
  return id.replaceAll('-', '').toLowerCase();
}

export function isGeoId(id: string): boolean {
  if (UUID_WITHOUT_DASHES_REGEX.test(id)) return true;
  if (UUID_WITH_DASHES_REGEX.test(id)) return true;
  return UUID_WITHOUT_DASHES_REGEX.test(normalizeGeoId(id));
}

export function parseGeoId(id: string): GeoId {
  const normalized = normalizeGeoId(id);
  if (!UUID_WITHOUT_DASHES_REGEX.test(normalized)) {
    throw new Error(`Invalid Geo ID (expected UUID with or without dashes): ${id}`);
  }
  return normalized;
}

export function toUuid(id: string): string {
  const normalized = parseGeoId(id);
  return [
    normalized.slice(0, 8),
    normalized.slice(8, 12),
    normalized.slice(12, 16),
    normalized.slice(16, 20),
    normalized.slice(20),
  ].join('-');
}

/**
 * An Effect Schema that accepts UUIDs with or without dashes and always decodes/encodes
 * to the dashless (normalized) `GeoId` format.
 */
export const GeoIdSchema = Schema.transform(Schema.String, Schema.String, {
  strict: true,
  decode: (value: string) => parseGeoId(value),
  encode: (value: string) => parseGeoId(value),
}).pipe(Schema.annotations({ identifier: 'GeoId' }));
