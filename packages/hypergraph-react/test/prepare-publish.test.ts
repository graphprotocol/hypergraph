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
  const Person = Entity.Schema(
    {
      name: Type.String,
      age: Type.Number,
      email: Type.optional(Type.String),
      isActive: Type.Boolean,
      birthDate: Type.Date,
      location: Type.Point,
    },
    {
      types: [Id('a06dd0c63d384be1a8658c95be0ca35a')],
      properties: {
        name: Id('ed49ed7b17b34df6b0b511f78d82e151'),
        age: Id('a427183d35194c96b80a5a0c64daed41'),
        email: Id('43d6f432c6614c05bc655ddacdfd50bf'),
        isActive: Id('e425955442b146e484c3f8681987770f'),
        birthDate: Id('b5c0e2c79ac9415e8ffe34f8b530f126'),
        location: Id('45e707a5436442fbbb0b927a5a8bc061'),
      },
    },
  );

  const Company = Entity.Schema(
    {
      name: Type.String,
      employees: Type.Relation(Person),
    },
    {
      types: [Id('1d113495a1d84520be148bc5378dc4ad')],
      properties: {
        name: Id('907722dc2cd14baea81b263186b29dff'),
        employees: Id('6530b1dc24ce46ca95e7e89e87dd3839'),
      },
    },
  );

  // Entity class for testing optional types
  const OptionalFieldsEntity = Entity.Schema(
    {
      name: Type.String, // required field
      optionalNumber: Type.optional(Type.Number),
      optionalBoolean: Type.optional(Type.Boolean),
      optionalDate: Type.optional(Type.Date),
      optionalPoint: Type.optional(Type.Point),
    },
    {
      types: [Id('3f9e28c15b7d4e8f9a2c6d5e4f3a2b1c')],
      properties: {
        name: Id('2a8b9c7d4e5f6a7b8c9d0e1f2a3b4c5d'),
        optionalNumber: Id('eaf9f4f856474228aff58725368fc87c'),
        optionalBoolean: Id('2742d8b630594adbb439fdfcd588dccb'),
        optionalDate: Id('9b53690fea6d4bd8b4d39ea01e7f837f'),
        optionalPoint: Id('0c1d2e3f4a5b4c7d8e9f0a1b2c3d4e5f'),
      },
    },
  );

  const spaceId = '1e5e39daa00d4fd8b53b98095337112f';
  const publicSpaceId = '2e5e39daa00d4fd8b53b98095337112f';

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
        id: 'b7a8be837313441b804c4798f1e9aca7',
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

      expect(mockRequest).toHaveBeenCalledWith(`${Graph.TESTNET_API_ORIGIN}/v2/graphql`, expect.any(String), {
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
        id: '224e5e89a4d049deae1ba94533e7e464',
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
        id: '7f8c9d2e4b5a6c7d8e9f0a1b2c3d4e5f',
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
        id: 'f219bb225c2e49238f1d4565f362673d',
        type: 'Person',
        name: 'Employee 1',
        age: 30,
        isActive: true,
        birthDate: new Date('1993-01-01'),
        location: [0, 0],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const employee2 = {
        id: '94f01f8feb194fed9c038e875058dc2a',
        type: 'Person',
        name: 'Employee 2',
        age: 25,
        isActive: true,
        birthDate: new Date('1998-01-01'),
        location: [0, 0],
        __schema: Person,
      } as Entity.Entity<typeof Person>;

      const company = {
        id: 'd2033169590f4b88bf184719949ea953',
        type: 'Company',
        name: 'Test Company',
        employees: [
          { ...employee1, _relation: { id: 'ba8a247baf9d40ebad75aa8a23fb9911' } },
          { ...employee2, _relation: { id: '4f7504e8f2cc4284b2f22cd7fe1a6d90' } },
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
            { propertyId: 'ed49ed7b17b34df6b0b511f78d82e151', string: 'Old Name' },
            { propertyId: 'a427183d35194c96b80a5a0c64daed41', number: 25 },
            { propertyId: 'e425955442b146e484c3f8681987770f', boolean: false },
          ],
          relationsList: [],
        },
      });
    });

    it('should create update ops only for changed values', async () => {
      const entity = {
        id: '19085414a2814472a70daec835074be4',
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
            { propertyId: 'ed49ed7b17b34df6b0b511f78d82e151', string: 'Same Name' },
            { propertyId: 'a427183d35194c96b80a5a0c64daed41', number: 30 },
            { propertyId: 'e425955442b146e484c3f8681987770f', boolean: Graph.serializeBoolean(true) },
            { propertyId: 'b5c0e2c79ac9415e8ffe34f8b530f126', time: Graph.serializeDate(new Date('1993-01-01')) },
            { propertyId: '45e707a5436442fbbb0b927a5a8bc061', point: Graph.serializePoint([0, 0]) },
          ],
          relationsList: [],
        },
      });

      const entity = {
        id: '778ee1c4a4ac424c81b0565147fca460',
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
        id: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
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
        id: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
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
        id: 'a1b2c3d4e5f67a8b9c0d1e2f3a4b5c6d',
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
        id: '4d77f7bcfb124a8e922499b0b5cb09a9',
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
        id: 'c3d4e5f6a7b84c9d8e2f3a4b5c6d7e8f',
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
          id: '6ced2b76e46547dea7ffac9b27a41fd4',
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
          id: 'e68aa940845248de8523292ba3771f81',
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
          id: 'fde9afb68c5845bd86a71e5222f92284',
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
          id: '539cb728ca6e4d3cae6f0b5b6bcb570a',
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
        id: 'd4e5f6a7b8c94d1eaf3a4b5c6d7e8f9a',
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
          valuesList: [{ propertyId: '2a8b9c7d4e5f6a7b8c9d0e1f2a3b4c5d', value: 'Existing Entity' }],
          relationsList: [],
        },
      });

      const result = await preparePublish({
        entity: {
          id: 'e5f6a7b8c9d04e2fba4b5c6d7e8f9a0b',
          name: 'Existing Entity',
          optionalNumber: 100, // New field
          optionalBoolean: true, // New field
          optionalDate: new Date('2024-03-15'), // New field
          optionalPoint: [45.0, 90.0], // New field
          __schema: OptionalFieldsEntity,
        },
        publicSpace: publicSpaceId,
      });

      expect(result.ops).toBeDefined();
      expect(result.ops.length).toBeGreaterThan(0);
    });

    it('should remove optional fields from existing entity (set to undefined)', async () => {
      // Mock existing entity with optional fields
      mockRequest.mockResolvedValue({
        entity: {
          valuesList: [
            { propertyId: '2a8b9c7d4e5f6a7b8c9d0e1f2a3b4c5d', value: 'Existing Entity' },
            { propertyId: 'eaf9f4f856474228aff58725368fc87c', value: Graph.serializeNumber(50) },
            { propertyId: '2742d8b630594adbb439fdfcd588dccb', value: Graph.serializeBoolean(true) },
          ],
          relationsList: [],
        },
      });

      const entity = {
        id: 'f6a7b8c9d0e14f3abb5c6d7e8f9a0b1c',
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
            { propertyId: '2a8b9c7d4e5f6a7b8c9d0e1f2a3b4c5d', value: 'Existing Entity' },
            { propertyId: 'eaf9f4f856474228aff58725368fc87c', value: Graph.serializeNumber(75) },
            { propertyId: '9b53690fea6d4bd8b4d39ea01e7f837f', value: Graph.serializeDate(new Date('2023-01-01')) },
          ],
          relationsList: [],
        },
      });

      const entity = {
        id: '809c9f0adbe54208909217135f282613',
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
