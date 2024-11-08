import { expect, it } from 'vitest';
import { createIdentity } from './create-identity.js';

it.skip('should generate an identity', () => {
  expect(createIdentity()).toEqual({});
});
