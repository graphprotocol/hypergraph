import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { beforeEach, describe, expect, it } from 'vitest';

import * as Entity from '../../src/entity/index.js';
import * as Type from '../../src/type/type.js';
import { idToAutomergeId } from '../../src/utils/automergeId.js';

describe('findMany with filters', () => {
  // Define entity classes for testing
  class Person extends Entity.Class<Person>('Person')({
    name: Type.Text,
    age: Type.Number,
    isActive: Type.Checkbox,
  }) {}

  class Product extends Entity.Class<Product>('Product')({
    name: Type.Text,
    price: Type.Number,
    category: Type.Text,
  }) {}

  const spaceId = '1e5e39da-a00d-4fd8-b53b-98095337112f';
  const automergeDocId = idToAutomergeId(spaceId);

  let repo: Repo;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let handle: DocHandle<any>;

  beforeEach(() => {
    repo = new Repo({}); // reset to new Repo instance to clear created entities in tests
    const result = repo.findWithProgress(automergeDocId as AnyDocumentId);
    handle = result.handle;
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

  describe('Logical NOT operator', () => {
    it('should filter entities using NOT operator', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by name NOT equal to 'John'
      const result = Entity.findMany(
        handle,
        Person,
        {
          name: { not: { is: 'John' } },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Bob', 'Jane']);
    });

    it('should filter entities using NOT operator with number fields', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by age NOT equal to 30
      const result = Entity.findMany(
        handle,
        Person,
        {
          age: { not: { is: 30 } },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Bob', 'Jane']);
    });
  });

  describe('Logical OR operator', () => {
    it('should filter entities using OR operator', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by name equal to 'John' OR 'Jane'
      const result = Entity.findMany(
        handle,
        Person,
        {
          name: { or: [{ is: 'John' }, { is: 'Jane' }] },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Jane', 'John']);
    });

    it('should filter entities using OR operator with number fields', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by age equal to 25 OR 40
      const result = Entity.findMany(
        handle,
        Person,
        {
          age: { or: [{ is: 25 }, { is: 40 }] },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Bob', 'Jane']);
    });
  });

  describe('Combined NOT and OR operators', () => {
    it('should filter entities using combined NOT and OR operators', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by NOT (name is 'John' OR name is 'Jane')
      const result = Entity.findMany(
        handle,
        Person,
        {
          name: { not: { or: [{ is: 'John' }, { is: 'Jane' }] } },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Bob');
    });

    it('should filter entities using NOT with OR operator', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by NOT (name equal to 'John' OR 'Jane')
      const result = Entity.findMany(
        handle,
        Person,
        {
          name: { not: { or: [{ is: 'John' }, { is: 'Jane' }] } },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Bob');
    });
  });

  describe('Cross-field filters with OR and NOT', () => {
    it('should filter entities using OR across different fields', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by name contains 'o' OR age greater than 35
      const result = Entity.findMany(
        handle,
        Person,
        {
          or: [{ name: { contains: 'o' } }, { age: { greaterThan: 35 } }],
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Bob', 'John']);
    });

    it('should filter entities using NOT across different fields', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });

      // Filter by NOT (name starts with 'J' AND age less than 30)
      const result = Entity.findMany(
        handle,
        Person,
        {
          not: {
            name: { startsWith: 'J' },
            age: { lessThan: 30 },
          },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Bob', 'John']);
    });

    it('should filter entities using complex OR and NOT combinations', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });
      Entity.create(handle, Person)({ name: 'Alice', age: 35, isActive: true });

      // Filter by (name starts with 'J' AND age less than 30) OR (name contains 'i' AND isActive is true)
      const result = Entity.findMany(
        handle,
        Person,
        {
          or: [
            {
              name: { startsWith: 'J' },
              age: { lessThan: 30 },
            },
            {
              name: { contains: 'i' },
              isActive: { is: true },
            },
          ],
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Alice', 'Jane']);
    });

    it('should filter entities using nested OR and NOT operators', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });
      Entity.create(handle, Person)({ name: 'Alice', age: 35, isActive: true });

      // Filter by NOT (name starts with 'J') AND NOT (age greater than 35)
      const result = Entity.findMany(
        handle,
        Person,
        {
          name: { not: { startsWith: 'J' } },
          age: { not: { greaterThan: 35 } },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].name).toBe('Alice');
    });

    it('should filter products using cross-field filters with OR and NOT', () => {
      // Create test products
      Entity.create(handle, Product)({ name: 'Laptop', price: 999, category: 'Electronics' });
      Entity.create(handle, Product)({ name: 'Phone', price: 699, category: 'Electronics' });
      Entity.create(handle, Product)({ name: 'Desk Chair', price: 199, category: 'Furniture' });
      Entity.create(handle, Product)({ name: 'Smartphone', price: 799, category: 'Electronics' });
      Entity.create(handle, Product)({ name: 'Table', price: 299, category: 'Furniture' });

      // Filter by (category is 'Electronics' AND price greater than 800) OR (category is 'Furniture' AND name contains 'Chair')
      const result = Entity.findMany(
        handle,
        Product,
        {
          or: [
            {
              category: { is: 'Electronics' },
              price: { greaterThan: 800 },
            },
            {
              category: { is: 'Furniture' },
              name: { contains: 'Chair' },
            },
          ],
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Desk Chair', 'Laptop']);
    });

    it('should filter entities using OR combined with another field', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });
      Entity.create(handle, Person)({ name: 'Alice', age: 35, isActive: true });

      // Filter by (name starts with 'J' OR name contains 'i') AND isActive is true
      const result = Entity.findMany(
        handle,
        Person,
        {
          or: [{ name: { startsWith: 'J' } }, { name: { contains: 'i' } }],
          isActive: { is: true },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(3);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Alice', 'Jane', 'John']);
    });

    it('should filter entities using NOT combined with another field', () => {
      // Create test entities
      Entity.create(handle, Person)({ name: 'John', age: 30, isActive: true });
      Entity.create(handle, Person)({ name: 'Jane', age: 25, isActive: true });
      Entity.create(handle, Person)({ name: 'Bob', age: 40, isActive: false });
      Entity.create(handle, Person)({ name: 'Alice', age: 35, isActive: true });

      // Filter by NOT (name starts with 'J') AND age greater than 30
      const result = Entity.findMany(
        handle,
        Person,
        {
          not: { name: { startsWith: 'J' } },
          age: { greaterThan: 30 },
        },
        undefined,
      );
      expect(result.entities).toHaveLength(2);
      expect(result.entities.map((e) => e.name).sort()).toEqual(['Alice', 'Bob']);
    });
  });
});
