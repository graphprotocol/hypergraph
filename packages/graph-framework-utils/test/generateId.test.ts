import { expect, it } from 'vitest';

import { generateId } from '../src/generateId.js';

it('should generate a base58 encoded uuid of 22 char length', () => {
  const id = generateId();
  expect(id).toBeTypeOf('string');
  expect(id).toHaveLength(22);
});
