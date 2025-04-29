import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { beforeEach, describe, expect, it } from 'vitest';

import * as Entity from '../../src/entity/index.js';
import { idToAutomergeId } from '../../src/utils/automergeId.js';

describe('findMany with filters', () => {
  // Define entity classes for testing
  class Person extends Entity.Class<Person>('Person')({
    name: Entity.Text,
    age: Entity.Number,
    isActive: Entity.Checkbox,
  }) {}

  class Product extends Entity.Class<Product>('Product')({
    name: Entity.Text,
    price: Entity.Number,
    category: Entity.Text,
  }) {}

  const spaceId = '52gTkePWSoGdXmgZF3nRU';
  const automergeDocId = idToAutomergeId(spaceId);

  let repo: Repo;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let handle: DocHandle<any>;

  beforeEach(() => {
    repo = new Repo({}); // reset to new Repo instance to clear created entities in tests
    handle = repo.find(automergeDocId as AnyDocumentId);
    // set it to ready to interact with the document
    handle.doneLoading();
  });

  describe('Text filters', () => {
    it('should filter entities by exact text match', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by exact name match
      const result = Entity.findMany(handle, Person, { name: { is: 'John' } }, undefined);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('John');
    });

    it('should filter entities by text startsWith', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by name starting with 'J'
      const result = Entity.findMany(handle, Person, { name: { startsWith: 'J' } }, undefined);
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Jane', 'John']);
    });

    it('should filter entities by text endsWith', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by name ending with 'e'
      const result = Entity.findMany(handle, Person, { name: { endsWith: 'e' } }, undefined);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Jane');
    });

    it('should filter entities by text contains', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by name containing 'an'
      const result = Entity.findMany(handle, Person, { name: { contains: 'an' } }, undefined);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Jane');
    });
  });

  describe('Number filters', () => {
    it('should filter entities by exact number match', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by exact age match
      const result = Entity.findMany(handle, Person, { age: { is: 30 } }, undefined);
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('John');
    });

    it('should filter entities by number greaterThan', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by age greater than 28
      const result = Entity.findMany(handle, Person, { age: { greaterThan: 28 } }, undefined);
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Bob', 'John']);
    });

    it('should filter entities by number lessThan', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by age less than 35
      const result = Entity.findMany(handle, Person, { age: { lessThan: 35 } }, undefined);
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Jane', 'John']);
    });
  });

  describe('Boolean filters', () => {
    it('should filter entities by boolean value', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by isActive = true
      const result = Entity.findMany(handle, Person, { isActive: { is: true } }, undefined);
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Jane', 'John']);
    });
  });

  describe('Multiple filters', () => {
    it('should apply multiple filters with AND logic', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by name starting with 'J' AND age less than 30
      const result = Entity.findMany(
        handle,
        Person,
        {
          name: { startsWith: 'J' },
          age: { lessThan: 30 },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Jane');
    });

    it('should apply multiple filters with AND logic', () => {
      // Create test products
      Entity.create(handle, Product)({ name: 'Laptop', price: 999, category: 'Electronics' });
      Entity.create(handle, Product)({ name: 'Phone', price: 999, category: 'Electronics' });
      Entity.create(handle, Product)({ name: 'Desk Chair', price: 199, category: 'Furniture' });
      Entity.create(handle, Product)({ name: 'Smartphone', price: 699, category: 'Electronics' });
      Entity.create(handle, Product)({ name: 'Table', price: 299, category: 'Furniture' });

      // Filter by category 'Electronics' AND price greater than 800
      const result = Entity.findMany(
        handle,
        Product,
        {
          category: { is: 'Electronics' },
          price: { greaterThan: 800 },
          name: { startsWith: 'L' },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Laptop');
    });
  });
});
