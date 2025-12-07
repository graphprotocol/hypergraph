import { describe, expect, it } from 'vitest';
import { getRelationAlias } from '../../src/utils/relation-query-helpers.js';

describe('getRelationAlias', () => {
  it('falls back to property typeId when no target typeIds are provided', () => {
    expect(getRelationAlias('f44ae32a-2f13-4d3f-875f-19d2338a32b8')).toBe(
      'relations_f44ae32a_2f13_4d3f_875f_19d2338a32b8',
    );
  });

  it('includes canonicalized target typeIds in the alias', () => {
    const alias = getRelationAlias('f44ae32a-2f13-4d3f-875f-19d2338a32b8', ['type-b', 'type-a']);

    expect(alias).toBe('relations_f44ae32a_2f13_4d3f_875f_19d2338a32b8_type_a_type_b');
  });

  it('produces the same alias regardless of target typeId order or duplicates', () => {
    const aliasA = getRelationAlias('type-id', ['type-b', 'type-a', 'type-b']);
    const aliasB = getRelationAlias('type-id', ['type-a', 'type-b']);

    expect(aliasA).toBe(aliasB);
  });
});
