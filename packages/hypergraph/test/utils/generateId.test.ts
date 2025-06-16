import { validate as validateUuid } from 'uuid';
import { expect, it } from 'vitest';
import { generateId } from '../../src/utils/generateId.js';

it('should generate a valid uuid', () => {
  const id = generateId();
  expect(id).toBeTypeOf('string');
  expect(validateUuid(id)).toBe(true);
});
