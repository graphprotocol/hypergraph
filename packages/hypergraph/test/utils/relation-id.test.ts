import { Id } from '@graphprotocol/grc-20';
import { expect, it } from 'vitest';
import { relationId } from '../../src/utils/relation-id.js';

it('should generate a base58 encoded uuid of 22 char length', () => {
  const id = relationId({
    fromId: Id.Id('FDrkW1zJM6UipRPqk8BBqz'),
    toId: Id.Id('UZK9odf3uqkB8HEzCe4dc8'),
    entityId: Id.Id('RTGLWAUh6wZfjshdfdczRS'),
  });
  expect(id).toBeTypeOf('string');
  expect(id.length === 22).toBe(true);
  expect(id).toBe('Lo1Lkv4wMopEGV4KaWUBYW');
  expect(Id.isValid(id)).toBe(true);

  const id2 = relationId({
    fromId: Id.Id('WovPRxmeyU5pPMAbEYU5Z3'),
    toId: Id.Id('ULhfPQ7DNguVzPGGKbWYkc'),
    entityId: Id.Id('Ckdte5joXu2dD2k2ppDv7D'),
  });
  expect(id2).toBeTypeOf('string');
  expect(id2.length === 22).toBe(true);
  expect(id2).toBe('C8sK6KrRYvY6CPdWdYnsSw');
  expect(Id.isValid(id2)).toBe(true);
});
