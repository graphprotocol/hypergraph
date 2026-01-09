import { expect, it } from 'vitest';
import { generateId } from '../../src/utils/generateId.js';

it('should generate a valid uuid', () => {
  const id = generateId();
  expect(id).toBeTypeOf('string');
  expect(id).toMatch(/^[0-9a-f]{32}$/i);
});
