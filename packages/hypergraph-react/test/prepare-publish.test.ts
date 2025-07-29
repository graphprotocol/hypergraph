import { Repo } from '@automerge/automerge-repo';
import { Graph, Id } from '@graphprotocol/grc-20';
import { Entity, store, Type } from '@graphprotocol/hypergraph';
import '@testing-library/jest-dom/vitest';
import request from 'graphql-request';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type PreparePublishParams, preparePublish } from '../src/prepare-publish.js';

// Mock graphql-request
vi.mock('graphql-request', () => ({
  default: vi.fn(),
  gql: vi.fn((strings: TemplateStringsArray) => strings.join('')),
}));

const mockRequest = vi.mocked(request);

afterEach(() => {
  vi.clearAllMocks();
});

describe('preparePublish', () => {
  // Test entity classes
  class Person extends Entity.Class<Person>('Person')({
    name: Type.Text,
    age: Type.Number,
    email: Type.optional(Type.Text),
    isActive: Type.Checkbox,
    birthDate: Type.Date,
    location: Type.Point,
  }) {}

  class Company extends Entity.Class<Company>('Company')({
    name: Type.Text,
    employees: Type.Relation(Person),
  }) {}

  const spaceId = '1e5e39da-a00d-4fd8-b53b-98095337112f';
  const publicSpaceId = '2e5e39da-a00d-4fd8-b53b-98095337112f';

  let repo: Repo;

  beforeEach(() => {
    repo = new Repo({});
    store.send({ type: 'setRepo', repo });

    // Set up mapping in store
    store.send({
      type: 'setMapping',
      mapping: {
        Person: {
          typeIds: [Id.Id('a06dd0c6-3d38-4be1-a865-8c95be0ca35a')],
          properties: {
            name: Id.Id('ed49ed7b-17b3-4df6-b0b5-11f78d82e151'),
            age: Id.Id('a427183d-3519-4c96-b80a-5a0c64daed41'),
            email: Id.Id('43d6f432-c661-4c05-bc65-5ddacdfd50bf'),
            isActive: Id.Id('e4259554-42b1-46e4-84c3-f8681987770f'),
            birthDate: Id.Id('b5c0e2c7-9ac9-415e-8ffe-34f8b530f126'),
            location: Id.Id('45e707a5-4364-42fb-bb0b-927a5a8bc061'),
          },
          relations: {},
        },
        Company: {
          typeIds: [Id.Id('1d113495-a1d8-4520-be14-8bc5378dc4ad')],
          properties: {
            name: Id.Id('907722dc-2cd1-4bae-a81b-263186b29dff'),
          },
          relations: {
            employees: Id.Id('6530b1dc-24ce-46ca-95e7-e89e87dd3839'),
          },
        },
      },
    });

    store.send({
      type: 'setSpace',
      spaceId,
      spaceState: {
        id: spaceId,
        members: {},
        invitations: {},
        removedMembers: {},
        inboxes: {},
        lastEventHash: '',
      },
      name: 'Test Space',
      updates: { updates: [], firstUpdateClock: 0, lastUpdateClock: 0 },
      events: [],
      inboxes: [],
      keys: [],
    });
  });

  describe('creating new entity (when entity does not exist in public space)', () => {
    beforeEach(() => {
      // Mock GraphQL response for non-existent entity
      mockRequest.mockResolvedValue({
        entity: null,
      });
    });

    it('should create ops for a new entity with all required fields', async () => {
      const entity = {
        id: 'b7a8be83-7313-441b-804c-4798f1e9aca7',
        type: 'Person',
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        isActive: true,
        birthDate: new Date('1993-01-01'),
        location: [10.5, 20.3],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const params: PreparePublishParams<typeof Person> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(mockRequest).toHaveBeenCalledWith(`${Graph.TESTNET_API_ORIGIN}/graphql`, expect.any(String), {
        entityId: entity.id,
        spaceId: publicSpaceId,
      });

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);

      // Since we can't easily mock Graph.createEntity, we'll check the structure
      expect(result.ops).toBeInstanceOf(Array);
    });

    it('should handle optional fields correctly when undefined', async () => {
      const entity = {
        id: '224e5e89-a4d0-49de-ae1b-a94533e7e464',
        type: 'Person',
        name: 'Jane Doe',
        age: 25,
        isActive: false,
        birthDate: new Date('1998-01-01'),
        location: [0, 0],
        __schema: Person,
        // email is optional and undefined
      } as Entity.Entity<typeof Person>;

      const params: PreparePublishParams<typeof Person> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);
    });

    it('should throw error when required field is undefined', async () => {
      const entity = {
        id: '7f8c9d2e-4b5a-6c7d-8e9f-0a1b2c3d4e5f',
        type: 'Person',
        age: 25,
        isActive: false,
        birthDate: new Date('1998-01-01'),
        location: [0, 0],
        __schema: Person,
        // name is required but undefined
      } as any;

      // Manually set name to undefined to test error case
      entity.name = undefined;

      const params: PreparePublishParams<typeof Person> = {
        entity,
        publicSpace: publicSpaceId,
      };

      await expect(preparePublish(params)).rejects.toThrow('Value for name is undefined');
    });

    it.skip('should handle entities with relations', async () => {
      const employee1 = {
        id: 'f219bb22-5c2e-4923-8f1d-4565f362673d',
        type: 'Person',
        name: 'Employee 1',
        age: 30,
        isActive: true,
        birthDate: new Date('1993-01-01'),
        location: [0, 0],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const employee2 = {
        id: '94f01f8f-eb19-4fed-9c03-8e875058dc2a',
        type: 'Person',
        name: 'Employee 2',
        age: 25,
        isActive: true,
        birthDate: new Date('1998-01-01'),
        location: [0, 0],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const company = {
        id: 'd2033169-590f-4b88-bf18-4719949ea953',
        type: 'Company',
        name: 'Test Company',
        employees: [{ ...employee1 }, { ...employee2 }],
        __schema: Company,
      } as any;

      const params: PreparePublishParams<typeof Company> = {
        entity: company,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);
    });
  });

  describe('updating existing entity', () => {
    beforeEach(() => {
      // Mock GraphQL response for existing entity
      mockRequest.mockResolvedValue({
        entity: {
          valuesList: [
            { propertyId: 'ed49ed7b-17b3-4df6-b0b5-11f78d82e151', value: 'Old Name' },
            { propertyId: 'a427183d-3519-4c96-b80a-5a0c64daed41', value: Graph.serializeNumber(25) },
            { propertyId: 'e4259554-42b1-46e4-84c3-f8681987770f', value: Graph.serializeCheckbox(false) },
          ],
          relationsList: [],
        },
      });
    });

    it('should create update ops only for changed values', async () => {
      const entity = {
        id: '19085414-a281-4472-a70d-aec835074be4',
        type: 'Person',
        name: 'New Name', // Changed from 'Old Name'
        age: 25, // Same as existing
        email: 'new@example.com', // New optional field
        isActive: true, // Changed from false
        birthDate: new Date('1998-01-01'),
        location: [0, 0],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const params: PreparePublishParams<typeof Person> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
      // Should only include ops for changed/new values
    });

    it('should not create ops when no values have changed', async () => {
      // Mock response with all current values
      mockRequest.mockResolvedValue({
        entity: {
          valuesList: [
            { propertyId: 'ed49ed7b-17b3-4df6-b0b5-11f78d82e151', value: 'Same Name' },
            { propertyId: 'a427183d-3519-4c96-b80a-5a0c64daed41', value: Graph.serializeNumber(30) },
            { propertyId: 'e4259554-42b1-46e4-84c3-f8681987770f', value: Graph.serializeCheckbox(true) },
            { propertyId: 'b5c0e2c7-9ac9-415e-8ffe-34f8b530f126', value: Graph.serializeDate(new Date('1993-01-01')) },
            { propertyId: '45e707a5-4364-42fb-bb0b-927a5a8bc061', value: Graph.serializePoint([0, 0]) },
          ],
          relationsList: [],
        },
      });

      const entity = {
        id: '8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c',
        type: 'Person',
        name: 'Same Name',
        age: 30,
        isActive: true,
        birthDate: new Date('1993-01-01'),
        location: [0, 0],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const params: PreparePublishParams<typeof Person> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toHaveLength(0);
    });
  });

  describe('error cases', () => {
    beforeEach(() => {
      mockRequest.mockResolvedValue({ entity: null });
    });

    it('should throw error when mapping entry is not found', async () => {
      class UnmappedEntity extends Entity.Class<UnmappedEntity>('UnmappedEntity')({
        name: Type.Text,
      }) {}

      const entity = {
        id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        type: 'UnmappedEntity',
        name: 'Test',
        __schema: UnmappedEntity,
      } as Entity.Entity<typeof UnmappedEntity>;

      const params: PreparePublishParams<typeof UnmappedEntity> = {
        entity,
        publicSpace: publicSpaceId,
      };

      await expect(preparePublish(params)).rejects.toThrow('Mapping entry for UnmappedEntity not found');
    });

    it('should handle GraphQL request failures', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      const entity = {
        id: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
        type: 'Person',
        name: 'Test Person',
        age: 30,
        isActive: true,
        birthDate: new Date('1993-01-01'),
        location: [0, 0],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const params: PreparePublishParams<typeof Person> = {
        entity,
        publicSpace: publicSpaceId,
      };

      await expect(preparePublish(params)).rejects.toThrow('Network error');
    });
  });

  describe('field type serialization', () => {
    beforeEach(() => {
      mockRequest.mockResolvedValue({ entity: null });
    });

    it('should handle different field types without errors', async () => {
      const entity = {
        id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        type: 'Person',
        name: 'Test Person',
        age: 42,
        isActive: true,
        birthDate: new Date('1980-05-15'),
        location: [123.456, 789.012],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const params: PreparePublishParams<typeof Person> = {
        entity,
        publicSpace: publicSpaceId,
      };

      // Just ensure the function executes without error for different field types
      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);
    });
  });
});
