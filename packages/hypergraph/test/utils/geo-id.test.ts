import { Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { GeoIdSchema, parseGeoId, toUuid } from '../../src/utils/geo-id.js';

describe('geo-id', () => {
  it('parses and normalizes dashed UUIDs to dashless geo ids', () => {
    expect(parseGeoId('1e5e39da-a00d-4fd8-b53b-98095337112f')).toBe('1e5e39daa00d4fd8b53b98095337112f');
  });

  it('accepts already-dashless geo ids', () => {
    expect(parseGeoId('1e5e39daa00d4fd8b53b98095337112f')).toBe('1e5e39daa00d4fd8b53b98095337112f');
  });

  it('can re-format a geo id into dashed UUID form', () => {
    expect(toUuid('1e5e39daa00d4fd8b53b98095337112f')).toBe('1e5e39da-a00d-4fd8-b53b-98095337112f');
  });

  it('GeoIdSchema decodes to normalized dashless format', () => {
    const decoded = Schema.decodeSync(GeoIdSchema)('1e5e39da-a00d-4fd8-b53b-98095337112f');
    expect(decoded).toBe('1e5e39daa00d4fd8b53b98095337112f');
  });
});
