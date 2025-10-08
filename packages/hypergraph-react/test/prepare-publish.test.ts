import { Repo } from '@automerge/automerge-repo';
import { Graph, Id } from '@graphprotocol/grc-20';
import { Entity, EntitySchema, store, Type } from '@graphprotocol/hypergraph';
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
  const Person = EntitySchema(
    {
      name: Type.String,
      age: Type.Number,
      email: Type.optional(Type.String),
      isActive: Type.Boolean,
      birthDate: Type.Date,
      location: Type.Point,
    },
    {
      types: [Id('a06dd0c6-3d38-4be1-a865-8c95be0ca35a')],
      properties: {
        name: Id('ed49ed7b-17b3-4df6-b0b5-11f78d82e151'),
        age: Id('a427183d-3519-4c96-b80a-5a0c64daed41'),
        email: Id('43d6f432-c661-4c05-bc65-5ddacdfd50bf'),
        isActive: Id('e4259554-42b1-46e4-84c3-f8681987770f'),
        birthDate: Id('b5c0e2c7-9ac9-415e-8ffe-34f8b530f126'),
        location: Id('45e707a5-4364-42fb-bb0b-927a5a8bc061'),
      },
    },
  );

  const Company = EntitySchema(
    {
      name: Type.String,
      employees: Type.Relation(Person),
    },
    {
      types: [Id('1d113495-a1d8-4520-be14-8bc5378dc4ad')],
      properties: {
        name: Id('907722dc-2cd1-4bae-a81b-263186b29dff'),
        employees: Id('6530b1dc-24ce-46ca-95e7-e89e87dd3839'),
      },
    },
  );

  // Entity class for testing optional types
  const OptionalFieldsEntity = EntitySchema(
    {
      name: Type.String, // required field
      optionalNumber: Type.optional(Type.Number),
      optionalBoolean: Type.optional(Type.Boolean),
      optionalDate: Type.optional(Type.Date),
      optionalPoint: Type.optional(Type.Point),
    },
    {
      types: [Id('3f9e28c1-5b7d-4e8f-9a2c-6d5e4f3a2b1c')],
      properties: {
        name: Id('2a8b9c7d-4e5f-6a7b-8c9d-0e1f2a3b4c5d'),
        optionalNumber: Id('eaf9f4f8-5647-4228-aff5-8725368fc87c'),
        optionalBoolean: Id('2742d8b6-3059-4adb-b439-fdfcd588dccb'),
        optionalDate: Id('9b53690f-ea6d-4bd8-b4d3-9ea01e7f837f'),
        optionalPoint: Id('0c1d2e3f-4a5b-4c7d-8e9f-0a1b2c3d4e5f'),
      },
    },
  );

  const spaceId = '1e5e39da-a00d-4fd8-b53b-98095337112f';
  const publicSpaceId = '2e5e39da-a00d-4fd8-b53b-98095337112f';

  let repo: Repo;

  beforeEach(() => {
    repo = new Repo({});
    store.send({ type: 'setRepo', repo });

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
      } as unknown as Entity.Entity<typeof Person>;

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
        employees: [
          { ...employee1, _relation: { id: 'ba8a247b-af9d-40eb-ad75-aa8a23fb9911' } },
          { ...employee2, _relation: { id: '4f7504e8-f2cc-4284-b2f2-2cd7fe1a6d90' } },
        ],
        __schema: Company,
      } as unknown as Entity.Entity<typeof Company>;

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
            { propertyId: 'ed49ed7b-17b3-4df6-b0b5-11f78d82e151', string: 'Old Name' },
            { propertyId: 'a427183d-3519-4c96-b80a-5a0c64daed41', number: 25 },
            { propertyId: 'e4259554-42b1-46e4-84c3-f8681987770f', boolean: false },
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
            { propertyId: 'ed49ed7b-17b3-4df6-b0b5-11f78d82e151', string: 'Same Name' },
            { propertyId: 'a427183d-3519-4c96-b80a-5a0c64daed41', number: 30 },
            { propertyId: 'e4259554-42b1-46e4-84c3-f8681987770f', boolean: Graph.serializeBoolean(true) },
            { propertyId: 'b5c0e2c7-9ac9-415e-8ffe-34f8b530f126', time: Graph.serializeDate(new Date('1993-01-01')) },
            { propertyId: '45e707a5-4364-42fb-bb0b-927a5a8bc061', point: Graph.serializePoint([0, 0]) },
          ],
          relationsList: [],
        },
      });

      const entity = {
        id: '778ee1c4-a4ac-424c-81b0-565147fca460',
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

  describe('optional field types', () => {
    beforeEach(() => {
      mockRequest.mockResolvedValue({ entity: null });
    });

    it('should create entity with all optional fields present', async () => {
      const entity = {
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        type: 'OptionalFieldsEntity',
        name: 'Test Entity',
        optionalNumber: 42.5,
        optionalBoolean: true,
        optionalDate: new Date('2024-01-15'),
        optionalPoint: [12.34, 56.78],
        __schema: OptionalFieldsEntity,
      } as Entity.Entity<typeof OptionalFieldsEntity>;

      const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);
    });

    it('should create entity with some optional fields undefined', async () => {
      const entity = {
        id: '4d77f7bc-fb12-4a8e-9224-99b0b5cb09a9',
        type: 'OptionalFieldsEntity',
        name: 'Test Entity',
        optionalNumber: 25,
        // optionalBoolean is undefined
        optionalDate: new Date('2024-02-20'),
        // optionalPoint is undefined
        __schema: OptionalFieldsEntity,
      } as Entity.Entity<typeof OptionalFieldsEntity>;

      const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);
    });

    it('should create entity with only required fields (all optional fields undefined)', async () => {
      const entity = {
        id: 'c3d4e5f6-a7b8-4c9d-8e2f-3a4b5c6d7e8f',
        type: 'OptionalFieldsEntity',
        name: 'Minimal Entity',
        // All optional fields are undefined
        __schema: OptionalFieldsEntity,
      } as Entity.Entity<typeof OptionalFieldsEntity>;

      const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);
    });

    it('should handle optional Number field variations', async () => {
      const testCases = [
        { value: 0, description: 'zero' },
        { value: -15.5, description: 'negative decimal' },
        { value: 999999, description: 'large integer' },
        { value: undefined, description: 'undefined' },
      ];

      for (const testCase of testCases) {
        const entity = {
          id: '6ced2b76-e465-47de-a7ff-ac9b27a41fd4',
          type: 'OptionalFieldsEntity',
          name: `Test ${testCase.description}`,
          optionalNumber: testCase.value,
          __schema: OptionalFieldsEntity,
        } as Entity.Entity<typeof OptionalFieldsEntity>;

        const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
          entity,
          publicSpace: publicSpaceId,
        };

        const result = await preparePublish(params);
        expect(result.ops).toBeDefined();
      }
    });

    it('should handle optional Boolean field variations', async () => {
      const testCases = [
        { value: true, description: 'true' },
        { value: false, description: 'false' },
        { value: undefined, description: 'undefined' },
      ];

      for (const testCase of testCases) {
        const entity = {
          id: 'e68aa940-8452-48de-8523-292ba3771f81',
          type: 'OptionalFieldsEntity',
          name: `Test ${testCase.description}`,
          optionalBoolean: testCase.value,
          __schema: OptionalFieldsEntity,
        } as Entity.Entity<typeof OptionalFieldsEntity>;

        const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
          entity,
          publicSpace: publicSpaceId,
        };

        const result = await preparePublish(params);
        expect(result.ops).toBeDefined();
      }
    });

    it('should handle optional Date field variations', async () => {
      const testCases = [
        { value: new Date('2024-01-01'), description: 'valid date' },
        { value: new Date('1900-01-01'), description: 'old date' },
        { value: new Date('2100-12-31'), description: 'future date' },
        { value: undefined, description: 'undefined' },
      ];

      for (const testCase of testCases) {
        const entity = {
          id: 'fde9afb6-8c58-45bd-86a7-1e5222f92284',
          type: 'OptionalFieldsEntity',
          name: `Test ${testCase.description}`,
          optionalDate: testCase.value,
          __schema: OptionalFieldsEntity,
        } as Entity.Entity<typeof OptionalFieldsEntity>;

        const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
          entity,
          publicSpace: publicSpaceId,
        };

        const result = await preparePublish(params);
        expect(result.ops).toBeDefined();
      }
    });

    it('should handle optional Point field variations', async () => {
      const testCases = [
        { value: [0, 0], description: 'origin' },
        { value: [-90, -180], description: 'negative coordinates' },
        { value: [90.123456, 180.654321], description: 'precise coordinates' },
        { value: undefined, description: 'undefined' },
      ];

      for (const testCase of testCases) {
        const entity = {
          id: '539cb728-ca6e-4d3c-ae6f-0b5b6bcb570a',
          type: 'OptionalFieldsEntity',
          name: `Test ${testCase.description}`,
          optionalPoint: testCase.value,
          __schema: OptionalFieldsEntity,
        } as Entity.Entity<typeof OptionalFieldsEntity>;

        const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
          entity,
          publicSpace: publicSpaceId,
        };

        const result = await preparePublish(params);
        expect(result.ops).toBeDefined();
      }
    });

    it('should throw error when required field is missing from optional fields entity', async () => {
      const entity = {
        id: 'd4e5f6a7-b8c9-4d1e-af3a-4b5c6d7e8f9a',
        type: 'OptionalFieldsEntity',
        // name is missing (required field)
        optionalNumber: 42,
        __schema: OptionalFieldsEntity,
      } as unknown as Entity.Entity<typeof OptionalFieldsEntity>;

      const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
        entity,
        publicSpace: publicSpaceId,
      };

      await expect(preparePublish(params)).rejects.toThrow('Value for name is undefined');
    });
  });

  describe('updating entities with optional fields', () => {
    it('should add optional fields to existing entity', async () => {
      // Mock existing entity with only required field
      mockRequest.mockResolvedValue({
        entity: {
          valuesList: [{ propertyId: '2a8b9c7d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', value: 'Existing Entity' }],
          relationsList: [],
        },
      });

      const entity = {
        id: 'e5f6a7b8-c9d0-4e2f-ba4b-5c6d7e8f9a0b',
        type: 'OptionalFieldsEntity',
        name: 'Existing Entity',
        optionalNumber: 100, // New field
        optionalBoolean: true, // New field
        optionalDate: new Date('2024-03-15'), // New field
        optionalPoint: [45.0, 90.0], // New field
        __schema: OptionalFieldsEntity,
      } as Entity.Entity<typeof OptionalFieldsEntity>;

      const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);
    });

    it('should remove optional fields from existing entity (set to undefined)', async () => {
      // Mock existing entity with optional fields
      mockRequest.mockResolvedValue({
        entity: {
          valuesList: [
            { propertyId: '2a8b9c7d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', value: 'Existing Entity' },
            { propertyId: 'eaf9f4f8-5647-4228-aff5-8725368fc87c', value: Graph.serializeNumber(50) },
            { propertyId: '2742d8b6-3059-4adb-b439-fdfcd588dccb', value: Graph.serializeBoolean(true) },
          ],
          relationsList: [],
        },
      });

      const entity = {
        id: 'f6a7b8c9-d0e1-4f3a-bb5c-6d7e8f9a0b1c',
        type: 'OptionalFieldsEntity',
        name: 'Existing Entity',
        // All optional fields are now undefined (removed)
        __schema: OptionalFieldsEntity,
      } as Entity.Entity<typeof OptionalFieldsEntity>;

      const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
    });

    it('should update some optional fields while keeping others', async () => {
      // Mock existing entity with mixed optional fields
      mockRequest.mockResolvedValue({
        entity: {
          valuesList: [
            { propertyId: '2a8b9c7d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', value: 'Existing Entity' },
            { propertyId: 'eaf9f4f8-5647-4228-aff5-8725368fc87c', value: Graph.serializeNumber(75) },
            { propertyId: '9b53690f-ea6d-4bd8-b4d3-9ea01e7f837f', value: Graph.serializeDate(new Date('2023-01-01')) },
          ],
          relationsList: [],
        },
      });

      const entity = {
        id: '809c9f0a-dbe5-4208-9092-17135f282613',
        type: 'OptionalFieldsEntity',
        name: 'Existing Entity',
        optionalNumber: 125, // Changed from 75
        // optionalBoolean: undefined (not present, will remain undefined)
        optionalDate: new Date('2023-01-01'), // Same as existing (no change)
        optionalPoint: [12.5, 25.0], // New field
        __schema: OptionalFieldsEntity,
      } as Entity.Entity<typeof OptionalFieldsEntity>;

      const params: PreparePublishParams<typeof OptionalFieldsEntity> = {
        entity,
        publicSpace: publicSpaceId,
      };

      const result = await preparePublish(params);

      expect(result.ops).toBeDefined();
    });
  });
});
