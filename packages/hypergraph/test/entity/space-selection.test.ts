import { describe, expect, it } from 'vitest';
import { normalizeSpaceSelection } from '../../src/entity/internal/space-selection.js';

describe('normalizeSpaceSelection', () => {
  it('returns single selection when only space is provided', () => {
    expect(normalizeSpaceSelection('space-id', undefined)).toEqual({
      mode: 'single',
      spaceId: 'space-id',
    });
  });

  it('returns many selection when spaces array is provided', () => {
    expect(normalizeSpaceSelection(undefined, ['space-1', 'space-2'])).toEqual({
      mode: 'many',
      spaceIds: ['space-1', 'space-2'],
    });
  });

  it('returns all selection when spaces is the string "all"', () => {
    expect(normalizeSpaceSelection(undefined, 'all')).toEqual({ mode: 'all' });
  });

  it('throws when both space and spaces are provided', () => {
    expect(() => normalizeSpaceSelection('space-id', ['space-2'])).toThrowError(
      'Provide either "space" or "spaces", not both.',
    );
  });

  it('throws when neither space nor spaces are provided', () => {
    expect(() => normalizeSpaceSelection(undefined, undefined)).toThrowError(
      'Either "space" or non-empty "spaces" must be provided.',
    );
  });

  it('throws when spaces array is empty despite being typed differently', () => {
    expect(() => normalizeSpaceSelection(undefined, [] as unknown as readonly [string, ...string[]])).toThrowError(
      'Either "space" or non-empty "spaces" must be provided.',
    );
  });
});
