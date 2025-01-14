import { isValidDocumentId } from '@automerge/automerge-repo';
import { describe, expect, it } from 'vitest';

import { automergeIdToId, idToAutomergeId } from '../../src/utils/automergeId.js';
import { generateId } from '../../src/utils/generateId.js';

describe('id <> automergeId conversion', () => {
  it('converts an id to an automergeId and back', () => {
    const id = generateId();
    const automergeId = idToAutomergeId(id);
    const id2 = automergeIdToId(automergeId);
    expect(id).toBe(id2);
    expect(isValidDocumentId(automergeId)).toBe(true);
  });

  it('throws an error for invalid Base58 characters', () => {
    expect(() => idToAutomergeId('!@#$%^&*()')).toThrowError();
  });

  it('throws an error for invalid Base58Check strings', () => {
    expect(() => automergeIdToId('11111111111111111111111111111111')).toThrowError();
  });
});
