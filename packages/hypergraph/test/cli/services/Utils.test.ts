import { describe, it } from '@effect/vitest';
import { Id } from '@geoprotocol/geo-sdk';
import { Effect } from 'effect';
import {
  buildMappingFileFromSchema,
  buildSchemaFile,
  parseHypergraphMapping,
  parseSchema,
} from '../../../src/cli/services/Utils.js';
import type { Mapping } from '../../../src/mapping/Mapping.js';

describe('parseSchema', () => {
  it.effect('should return empty types array for empty schema file', ({ expect }) =>
    Effect.gen(function* () {
      const emptySchemaContent = '';
      const emptyMapping: Mapping = {};

      const result = yield* parseSchema(emptySchemaContent, emptyMapping);

      yield* Effect.sync(() => {
        expect(result).toEqual({ types: [] });
      });
    }),
  );

  it.effect('should parse schema file correctly', ({ expect }) =>
    Effect.gen(function* () {
      const schemaContent = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.String,
}) {}

export class Todo extends Entity.Class<Todo>('Todo')({
  name: Type.String,
  completed: Type.Boolean,
  assignees: Type.Relation(User),
}) {}

export class Todo2 extends Entity.Class<Todo2>('Todo2')({
  name: Type.String,
  checked: Type.Boolean,
  assignees: Type.Relation(User),
  due: Type.Date,
  amount: Type.Number,
  point: Type.Point,
  website: Type.String,
}) {}

export class JobOffer extends Entity.Class<JobOffer>('JobOffer')({
  name: Type.String,
  salary: Type.Number,
}) {}

export class Company extends Entity.Class<Company>('Company')({
  name: Type.String,
  // address: Type.String,
  jobOffers: Type.Relation(JobOffer),
}) {}

export class Event extends Entity.Class<Event>('Event')({
  name: Type.String,
  // description: Type.String,
  sponsors: Type.Relation(Company),
}) {}`;

      const emptyMapping: Mapping = {};
      const result = yield* parseSchema(schemaContent, emptyMapping);

      yield* Effect.sync(() => {
        expect(result.types).toHaveLength(6);

        // Check User entity
        const userEntity = result.types.find((t) => t.name === 'User');
        expect(userEntity).toBeDefined();
        expect(userEntity?.properties).toHaveLength(1);
        expect(userEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: null,
          status: 'synced',
        });

        // Check Todo entity
        const todoEntity = result.types.find((t) => t.name === 'Todo');
        expect(todoEntity).toBeDefined();
        expect(todoEntity?.properties).toHaveLength(3);
        expect(todoEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: null,
          status: 'synced',
        });
        expect(todoEntity?.properties[1]).toMatchObject({
          name: 'completed',
          dataType: 'Boolean',
          knowledgeGraphId: null,
          status: 'synced',
        });
        expect(todoEntity?.properties[2]).toMatchObject({
          name: 'assignees',
          dataType: 'Relation(User)',
          relationType: 'User',
          knowledgeGraphId: null,
          status: 'synced',
        });

        // Check Todo2 entity with various types
        const todo2Entity = result.types.find((t) => t.name === 'Todo2');
        expect(todo2Entity).toBeDefined();
        expect(todo2Entity?.properties).toHaveLength(7);
        expect(todo2Entity?.properties[3]).toMatchObject({
          name: 'due',
          dataType: 'Date',
          knowledgeGraphId: null,
          status: 'synced',
        });
        expect(todo2Entity?.properties[4]).toMatchObject({
          name: 'amount',
          dataType: 'Number',
          knowledgeGraphId: null,
          status: 'synced',
        });
        expect(todo2Entity?.properties[5]).toMatchObject({
          name: 'point',
          dataType: 'Point',
          knowledgeGraphId: null,
          status: 'synced',
        });

        // Check Company entity with relation
        const companyEntity = result.types.find((t) => t.name === 'Company');
        expect(companyEntity).toBeDefined();
        expect(companyEntity?.properties).toHaveLength(2);
        expect(companyEntity?.properties[1]).toMatchObject({
          name: 'jobOffers',
          dataType: 'Relation(JobOffer)',
          relationType: 'JobOffer',
          knowledgeGraphId: null,
          status: 'synced',
        });
      });
    }),
  );

  it.effect('should parse schema file with mapping and resolve knowledgeGraphIds', ({ expect }) =>
    Effect.gen(function* () {
      const schemaContent = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class Event extends Entity.Class<Event>('Event')({
  name: Type.String,
  sponsors: Type.Relation(Company),
}) {}

export class Company extends Entity.Class<Company>('Company')({
  name: Type.String,
  jobOffers: Type.Relation(JobOffer),
}) {}

export class JobOffer extends Entity.Class<JobOffer>('JobOffer')({
  name: Type.String,
  salary: Type.Number,
}) {}`;

      // Use mapping from events app
      const mapping: Mapping = {
        Event: {
          typeIds: [Id('7f9562d4034d4385bf5cf02cdebba47a')],
          properties: {
            name: Id('a126ca530c8e48d5b88882c734c38935'),
          },
          relations: {
            sponsors: Id('6860bfacf7034289b789972d0aaf3abe'),
          },
        },
        Company: {
          typeIds: [Id('6c504df51a8f43d1bf2d1ef9fa5b08b5')],
          properties: {
            name: Id('a126ca530c8e48d5b88882c734c38935'),
          },
          relations: {
            jobOffers: Id('1203064e9741423589d497f4b22eddfb'),
          },
        },
        JobOffer: {
          typeIds: [Id('f60585af71b646749a26b74ca6c1cceb')],
          properties: {
            name: Id('a126ca530c8e48d5b88882c734c38935'),
            salary: Id('baa36ac978ac4cf783946b2d3006bebe'),
          },
        },
      };

      const result = yield* parseSchema(schemaContent, mapping);

      yield* Effect.sync(() => {
        expect(result.types).toHaveLength(3);

        // Check Event entity with resolved IDs
        const eventEntity = result.types.find((t) => t.name === 'Event');
        expect(eventEntity).toBeDefined();
        expect(eventEntity?.knowledgeGraphId).toBe('7f9562d4034d4385bf5cf02cdebba47a');
        expect(eventEntity?.properties).toHaveLength(2);
        expect(eventEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
          status: 'published',
        });
        expect(eventEntity?.properties[1]).toMatchObject({
          name: 'sponsors',
          dataType: 'Relation(Company)',
          relationType: 'Company',
          knowledgeGraphId: '6860bfacf7034289b789972d0aaf3abe',
          status: 'published',
        });

        // Check Company entity with resolved IDs
        const companyEntity = result.types.find((t) => t.name === 'Company');
        expect(companyEntity).toBeDefined();
        expect(companyEntity?.knowledgeGraphId).toBe('6c504df51a8f43d1bf2d1ef9fa5b08b5');
        expect(companyEntity?.properties).toHaveLength(2);
        expect(companyEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
          status: 'published',
        });
        expect(companyEntity?.properties[1]).toMatchObject({
          name: 'jobOffers',
          dataType: 'Relation(JobOffer)',
          relationType: 'JobOffer',
          knowledgeGraphId: '1203064e9741423589d497f4b22eddfb',
          status: 'published',
        });

        // Check JobOffer entity with resolved IDs
        const jobOfferEntity = result.types.find((t) => t.name === 'JobOffer');
        expect(jobOfferEntity).toBeDefined();
        expect(jobOfferEntity?.knowledgeGraphId).toBe('f60585af71b646749a26b74ca6c1cceb');
        expect(jobOfferEntity?.properties).toHaveLength(2);
        expect(jobOfferEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
          status: 'published',
        });
        expect(jobOfferEntity?.properties[1]).toMatchObject({
          name: 'salary',
          dataType: 'Number',
          knowledgeGraphId: 'baa36ac978ac4cf783946b2d3006bebe',
          status: 'published',
        });
      });
    }),
  );

  it.effect('should parse schema with optional properties', ({ expect }) =>
    Effect.gen(function* () {
      const schemaContent = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.String,
  email: Type.optional(Type.String),
}) {}

export class Event extends Entity.Class<Event>('Event')({
  name: Type.String,
  description: Type.optional(Type.String),
  location: Type.optional(Type.Point),
  startDate: Type.Date,
  endDate: Type.optional(Type.Date),
  organizer: Type.Relation(User),
  coOrganizers: Type.optional(Type.Relation(User)),
}) {}`;

      const emptyMapping: Mapping = {};
      const result = yield* parseSchema(schemaContent, emptyMapping);

      yield* Effect.sync(() => {
        expect(result.types).toHaveLength(2);

        // Check User entity with optional email
        const userEntity = result.types.find((t) => t.name === 'User');
        expect(userEntity).toBeDefined();
        expect(userEntity?.properties).toHaveLength(2);
        expect(userEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: null,
        });
        expect(userEntity?.properties[0].optional).toBeUndefined();
        expect(userEntity?.properties[1]).toMatchObject({
          name: 'email',
          dataType: 'String',
          knowledgeGraphId: null,
          optional: true,
        });

        // Check Event entity with multiple optional properties
        const eventEntity = result.types.find((t) => t.name === 'Event');
        expect(eventEntity).toBeDefined();
        expect(eventEntity?.properties).toHaveLength(7);

        // Required properties
        expect(eventEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: null,
        });
        expect(eventEntity?.properties[0].optional).toBeUndefined();

        expect(eventEntity?.properties[3]).toMatchObject({
          name: 'startDate',
          dataType: 'Date',
          knowledgeGraphId: null,
        });
        expect(eventEntity?.properties[3].optional).toBeUndefined();

        expect(eventEntity?.properties[5]).toMatchObject({
          name: 'organizer',
          dataType: 'Relation(User)',
          relationType: 'User',
          knowledgeGraphId: null,
        });
        expect(eventEntity?.properties[5].optional).toBeUndefined();

        // Optional properties
        expect(eventEntity?.properties[1]).toMatchObject({
          name: 'description',
          dataType: 'String',
          knowledgeGraphId: null,
          optional: true,
        });

        expect(eventEntity?.properties[2]).toMatchObject({
          name: 'location',
          dataType: 'Point',
          knowledgeGraphId: null,
          optional: true,
        });

        expect(eventEntity?.properties[4]).toMatchObject({
          name: 'endDate',
          dataType: 'Date',
          knowledgeGraphId: null,
          optional: true,
        });

        expect(eventEntity?.properties[6]).toMatchObject({
          name: 'coOrganizers',
          dataType: 'Relation(User)',
          relationType: 'User',
          knowledgeGraphId: null,
          optional: true,
        });
      });
    }),
  );
});

describe('parseHypergraphMapping', () => {
  it('should return empty mapping for empty module export', ({ expect }) => {
    const emptyModule = {};
    const result = parseHypergraphMapping(emptyModule);
    expect(result).toEqual({});
  });

  it('should return empty mapping for null/undefined module export', ({ expect }) => {
    expect(parseHypergraphMapping(null)).toEqual({});
    expect(parseHypergraphMapping(undefined)).toEqual({});
  });

  it('should return empty mapping when no valid mapping objects found', ({ expect }) => {
    const moduleExport = {
      someString: 'hello',
      someNumber: 42,
      someArray: [1, 2, 3],
      invalidObject: { foo: 'bar' },
    };
    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual({});
  });

  it('should return the single mapping when only one valid mapping found', ({ expect }) => {
    const mapping: Mapping = {
      User: {
        typeIds: [Id('a5fd07b1120f46c6b46f387ef98396a6')],
        properties: {
          name: Id('994edcff69964a779797a13e5e3efad8'),
        },
      },
    };

    const moduleExport = {
      someRandomExport: mapping,
      otherStuff: 'not a mapping',
    };

    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual(mapping);
  });

  it('should prefer "mapping" when multiple valid mappings exist', ({ expect }) => {
    const mappingPreferred: Mapping = {
      User: {
        typeIds: [Id('a5fd07b1120f46c6b46f387ef98396a6')],
      },
    };

    const otherMapping: Mapping = {
      Post: {
        typeIds: [Id('b5fd07b1120f46c6b46f387ef98396a6')],
      },
    };

    const moduleExport = {
      mapping: mappingPreferred,
      customMapping: otherMapping,
    };

    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual(mappingPreferred);
  });

  it('should prefer "default" when multiple valid mappings exist but no "mapping"', ({ expect }) => {
    const defaultMapping: Mapping = {
      User: {
        typeIds: [Id('a5fd07b1120f46c6b46f387ef98396a6')],
      },
    };

    const otherMapping: Mapping = {
      Post: {
        typeIds: [Id('b5fd07b1120f46c6b46f387ef98396a6')],
      },
    };

    const moduleExport = {
      default: defaultMapping,
      customMapping: otherMapping,
    };

    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual(defaultMapping);
  });

  it('should prefer "config" when no "mapping" or "default" exists', ({ expect }) => {
    const configMapping: Mapping = {
      User: {
        typeIds: [Id('a5fd07b1120f46c6b46f387ef98396a6')],
      },
    };

    const otherMapping: Mapping = {
      Post: {
        typeIds: [Id('b5fd07b1120f46c6b46f387ef98396a6')],
      },
    };

    const moduleExport = {
      config: configMapping,
      customMapping: otherMapping,
    };

    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual(configMapping);
  });

  it('should return first mapping when multiple exist with no preferred names', ({ expect }) => {
    const firstMapping: Mapping = {
      User: {
        typeIds: [Id('a5fd07b1120f46c6b46f387ef98396a6')],
      },
    };

    const secondMapping: Mapping = {
      Post: {
        typeIds: [Id('b5fd07b1120f46c6b46f387ef98396a6')],
      },
    };

    const moduleExport = {
      customMapping1: firstMapping,
      customMapping2: secondMapping,
    };

    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual(firstMapping);
  });

  it('should handle mappings with full structure including properties and relations', ({ expect }) => {
    const complexMapping: Mapping = {
      Event: {
        typeIds: [Id('7f9562d4034d4385bf5cf02cdebba47a')],
        properties: {
          name: Id('a126ca530c8e48d5b88882c734c38935'),
        },
        relations: {
          sponsors: Id('6860bfacf7034289b789972d0aaf3abe'),
        },
      },
      Company: {
        typeIds: [Id('6c504df51a8f43d1bf2d1ef9fa5b08b5')],
        properties: {
          name: Id('a126ca530c8e48d5b88882c734c38935'),
        },
        relations: {
          jobOffers: Id('1203064e9741423589d497f4b22eddfb'),
        },
      },
    };

    const moduleExport = { mapping: complexMapping };
    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual(complexMapping);
  });

  it('should handle mappings with empty typeIds array', ({ expect }) => {
    const mappingWithEmptyTypeIds: Mapping = {
      User: {
        typeIds: [],
        properties: {
          name: Id('994edcff69964a779797a13e5e3efad8'),
        },
      },
    };

    const moduleExport = { mapping: mappingWithEmptyTypeIds };
    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual(mappingWithEmptyTypeIds);
  });

  it('should handle edge case where typeIds exists but is not an array', ({ expect }) => {
    const invalidMapping = {
      User: {
        typeIds: 'not-an-array',
        properties: {
          name: Id('994edcff69964a779797a13e5e3efad8'),
        },
      },
    };

    const moduleExport = { mapping: invalidMapping };
    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual({});
  });
});

describe('buildSchemaFile', () => {
  it('should build schema file with single entity and single property', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'User',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.String
}) {}`;

    expect(result).toBe(expected);
  });

  it('should build schema file with multiple entities', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'User',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
        {
          name: 'Post',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'title',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'content',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.String
}) {}

export class Post extends Entity.Class<Post>('Post')({
  title: Type.String,
  content: Type.String
}) {}`;

    expect(result).toBe(expected);
  });

  it('should handle all primitive data types', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'TestEntity',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'text_field',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'numeric_field',
              dataType: 'Number' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'boolean_field',
              dataType: 'Boolean' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'date_field',
              dataType: 'Date' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'location_field',
              dataType: 'Point' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class TestEntity extends Entity.Class<TestEntity>('TestEntity')({
  textField: Type.String,
  numericField: Type.Number,
  booleanField: Type.Boolean,
  dateField: Type.Date,
  locationField: Type.Point
}) {}`;

    expect(result).toBe(expected);
  });

  it('should handle optional properties', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'User',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'email',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: true,
              status: 'synced' as const,
            },
            {
              name: 'age',
              dataType: 'Number' as const,
              knowledgeGraphId: null,
              optional: true,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.String,
  email: Type.optional(Type.String),
  age: Type.optional(Type.Number)
}) {}`;

    expect(result).toBe(expected);
  });

  it('should handle relation properties', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Post',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'title',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'author',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class Post extends Entity.Class<Post>('Post')({
  title: Type.String,
  author: Type.Relation(User)
}) {}`;

    expect(result).toBe(expected);
  });

  it('should handle optional relation properties', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Event',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'organizer',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'co_organizers',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: null,
              optional: true,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class Event extends Entity.Class<Event>('Event')({
  name: Type.String,
  organizer: Type.Relation(User),
  coOrganizers: Type.optional(Type.Relation(User))
}) {}`;

    expect(result).toBe(expected);
  });

  it('should convert snake_case property names to camelCase', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Product',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'product_name',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'unit_price',
              dataType: 'Number' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'is_available',
              dataType: 'Boolean' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class Product extends Entity.Class<Product>('Product')({
  productName: Type.String,
  unitPrice: Type.Number,
  isAvailable: Type.Boolean
}) {}`;

    expect(result).toBe(expected);
  });

  it('should handle empty schema', ({ expect }) => {
    const schema = {
      types: [],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

`;

    expect(result).toBe(expected);
  });

  it('should filter out entities with no name', ({ expect }) => {
    const schema = {
      types: [
        {
          name: '',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'field',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
        {
          name: 'ValidEntity',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'field',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class ValidEntity extends Entity.Class<ValidEntity>('ValidEntity')({
  field: Type.String
}) {}`;

    expect(result).toBe(expected);
  });

  it('should filter out entities with no properties', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'EmptyEntity',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [],
        },
        {
          name: 'ValidEntity',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'field',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class ValidEntity extends Entity.Class<ValidEntity>('ValidEntity')({
  field: Type.String
}) {}`;

    expect(result).toBe(expected);
  });

  it('should filter out properties with empty names', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'User',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: '',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'validField',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  validField: Type.String
}) {}`;

    expect(result).toBe(expected);
  });

  it('should handle complex schema with multiple entities and various property types', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'User',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'email',
              dataType: 'String' as const,
              knowledgeGraphId: 'b126ca530c8e48d5b88882c734c38935',
              optional: true,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'Event',
          knowledgeGraphId: '8f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'title',
              dataType: 'String' as const,
              knowledgeGraphId: 'c126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'start_date',
              dataType: 'Date' as const,
              knowledgeGraphId: 'd126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'location',
              dataType: 'Point' as const,
              knowledgeGraphId: 'e126ca530c8e48d5b88882c734c38935',
              optional: true,
              status: 'published' as const,
            },
            {
              name: 'organizer',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: 'f126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class User extends Entity.Class<User>('User')({
  name: Type.String,
  email: Type.optional(Type.String)
}) {}

export class Event extends Entity.Class<Event>('Event')({
  title: Type.String,
  startDate: Type.Date,
  location: Type.optional(Type.Point),
  organizer: Type.Relation(User)
}) {}`;

    expect(result).toBe(expected);
  });

  it('should handle unknown data types by defaulting to String', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'TestEntity',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'unknown_field',
              // biome-ignore lint/suspicious/noExplicitAny: test cases
              dataType: 'UnknownType' as any,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class TestEntity extends Entity.Class<TestEntity>('TestEntity')({
  unknownField: Type.String
}) {}`;

    expect(result).toBe(expected);
  });

  it('should convert class names to PascalCase', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'user_account',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'username',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
        {
          name: 'blog-post',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'title',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildSchemaFile(schema);
    const expected = `import { Entity, Type } from '@graphprotocol/hypergraph';

export class UserAccount extends Entity.Class<UserAccount>('UserAccount')({
  username: Type.String
}) {}

export class BlogPost extends Entity.Class<BlogPost>('BlogPost')({
  title: Type.String
}) {}`;

    expect(result).toBe(expected);
  });
});

describe('buildMappingFileFromSchema', () => {
  it('should build mapping file with single entity', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'User',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  User: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("a126ca530c8e48d5b88882c734c38935")
    },
  },
}`;

    expect(result).toBe(expected);
  });

  it('should handle multiple entities', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'User',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'Post',
          knowledgeGraphId: '8f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'title',
              dataType: 'String' as const,
              knowledgeGraphId: 'b126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  User: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("a126ca530c8e48d5b88882c734c38935")
    },
  },
  Post: {
    typeIds: [Id("8f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      title: Id("b126ca530c8e48d5b88882c734c38935")
    },
  },
}`;

    expect(result).toBe(expected);
  });

  it('should handle entities with multiple properties', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Product',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'price',
              dataType: 'Number' as const,
              knowledgeGraphId: 'b126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'available',
              dataType: 'Boolean' as const,
              knowledgeGraphId: 'c126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Product: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("a126ca530c8e48d5b88882c734c38935"),
      price: Id("b126ca530c8e48d5b88882c734c38935"),
      available: Id("c126ca530c8e48d5b88882c734c38935")
    },
  },
}`;

    expect(result).toBe(expected);
  });

  it('should handle entities with relations', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Post',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'title',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'author',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: 'b126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'User',
          knowledgeGraphId: '8f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'c126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Post: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      title: Id("a126ca530c8e48d5b88882c734c38935")
    },
    relations: {
      author: Id("b126ca530c8e48d5b88882c734c38935")
    },
  },
  User: {
    typeIds: [Id("8f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("c126ca530c8e48d5b88882c734c38935")
    },
  },
}`;

    expect(result).toBe(expected);
  });

  it('should handle entities with both properties and relations', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Event',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'description',
              dataType: 'String' as const,
              knowledgeGraphId: 'b126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'sponsors',
              dataType: 'Relation(Company)' as const,
              relationType: 'Company',
              knowledgeGraphId: '6860bfacf7034289b789972d0aaf3abe',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'attendees',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: 'd126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'Company',
          knowledgeGraphId: '8f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'e126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'User',
          knowledgeGraphId: '9f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'f126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Event: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("a126ca530c8e48d5b88882c734c38935"),
      description: Id("b126ca530c8e48d5b88882c734c38935")
    },
    relations: {
      sponsors: Id("6860bfacf7034289b789972d0aaf3abe"),
      attendees: Id("d126ca530c8e48d5b88882c734c38935")
    },
  },
  Company: {
    typeIds: [Id("8f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("e126ca530c8e48d5b88882c734c38935")
    },
  },
  User: {
    typeIds: [Id("9f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("f126ca530c8e48d5b88882c734c38935")
    },
  },
}`;

    expect(result).toBe(expected);
  });

  it('should handle entities with no knowledgeGraphId', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'User',
          knowledgeGraphId: null,
          status: 'synced' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);

    // When knowledgeGraphId is null, generateMapping will create new IDs
    // We just check the structure is correct
    expect(result).toMatch(/import \{ Id \} from '@graphprotocol\/hypergraph';/);
    expect(result).toMatch(/import type \{ Mapping \} from '@graphprotocol\/hypergraph\/mapping';/);
    expect(result).toMatch(/export const mapping: Mapping = \{/);
    expect(result).toMatch(/User: \{/);
    expect(result).toMatch(/typeIds: \[Id\("[a-f0-9-]+"\)\],/);
    expect(result).toMatch(/properties: \{/);
    expect(result).toMatch(/name: Id\("[a-f0-9-]+"\)/);
  });

  it('should handle entities with only properties and no relations', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Settings',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'theme',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'notifications_enabled',
              dataType: 'Boolean' as const,
              knowledgeGraphId: 'b126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Settings: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      theme: Id("a126ca530c8e48d5b88882c734c38935"),
      notificationsEnabled: Id("b126ca530c8e48d5b88882c734c38935")
    },
  },
}`;

    expect(result).toBe(expected);
  });

  it('should handle entities with only relations and no properties', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Friendship',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'user1',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'user2',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: 'b126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'User',
          knowledgeGraphId: '8f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'c126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Friendship: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    relations: {
      user1: Id("a126ca530c8e48d5b88882c734c38935"),
      user2: Id("b126ca530c8e48d5b88882c734c38935")
    },
  },
  User: {
    typeIds: [Id("8f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("c126ca530c8e48d5b88882c734c38935")
    },
  },
}`;

    expect(result).toBe(expected);
  });

  it('should convert snake_case property names to camelCase', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'UserProfile',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'first_name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'last_name',
              dataType: 'String' as const,
              knowledgeGraphId: 'b126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'profile_picture',
              dataType: 'Relation(Image)' as const,
              relationType: 'Image',
              knowledgeGraphId: 'c126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'Image',
          knowledgeGraphId: '8f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'url',
              dataType: 'String' as const,
              knowledgeGraphId: 'd126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  UserProfile: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      firstName: Id("a126ca530c8e48d5b88882c734c38935"),
      lastName: Id("b126ca530c8e48d5b88882c734c38935")
    },
    relations: {
      profilePicture: Id("c126ca530c8e48d5b88882c734c38935")
    },
  },
  Image: {
    typeIds: [Id("8f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      url: Id("d126ca530c8e48d5b88882c734c38935")
    },
  },
}`;

    expect(result).toBe(expected);
  });

  it('should handle mixed properties with and without knowledgeGraphId', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Article',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'title',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'content',
              dataType: 'String' as const,
              knowledgeGraphId: null,
              optional: undefined,
              status: 'synced' as const,
            },
            {
              name: 'author',
              dataType: 'Relation(User)' as const,
              relationType: 'User',
              knowledgeGraphId: 'c126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'User',
          knowledgeGraphId: '8f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'd126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);

    // Check structure and that title and author have the expected IDs
    expect(result).toMatch(/title: Id\("a126ca530c8e48d5b88882c734c38935"\)/);
    expect(result).toMatch(/author: Id\("c126ca530c8e48d5b88882c734c38935"\)/);
    // content should have a generated ID
    expect(result).toMatch(/content: Id\("[a-f0-9-]+"\)/);
  });

  it('should handle complex schema similar to the example in documentation', ({ expect }) => {
    const schema = {
      types: [
        {
          name: 'Event',
          knowledgeGraphId: '7f9562d4034d4385bf5cf02cdebba47a',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'sponsors',
              dataType: 'Relation(Company)' as const,
              relationType: 'Company',
              knowledgeGraphId: '6860bfacf7034289b789972d0aaf3abe',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'Company',
          knowledgeGraphId: '6c504df51a8f43d1bf2d1ef9fa5b08b5',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'job_offers',
              dataType: 'Relation(JobOffer)' as const,
              relationType: 'JobOffer',
              knowledgeGraphId: '1203064e9741423589d497f4b22eddfb',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
        {
          name: 'JobOffer',
          knowledgeGraphId: 'f60585af71b646749a26b74ca6c1cceb',
          status: 'published' as const,
          properties: [
            {
              name: 'name',
              dataType: 'String' as const,
              knowledgeGraphId: 'a126ca530c8e48d5b88882c734c38935',
              optional: undefined,
              status: 'published' as const,
            },
            {
              name: 'salary',
              dataType: 'Number' as const,
              knowledgeGraphId: 'baa36ac978ac4cf783946b2d3006bebe',
              optional: undefined,
              status: 'published' as const,
            },
          ],
        },
      ],
    };

    const result = buildMappingFileFromSchema(schema);
    const expected = `import type { Mapping } from '@graphprotocol/hypergraph/mapping';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Event: {
    typeIds: [Id("7f9562d4034d4385bf5cf02cdebba47a")],
    properties: {
      name: Id("a126ca530c8e48d5b88882c734c38935")
    },
    relations: {
      sponsors: Id("6860bfacf7034289b789972d0aaf3abe")
    },
  },
  Company: {
    typeIds: [Id("6c504df51a8f43d1bf2d1ef9fa5b08b5")],
    properties: {
      name: Id("a126ca530c8e48d5b88882c734c38935")
    },
    relations: {
      jobOffers: Id("1203064e9741423589d497f4b22eddfb")
    },
  },
  JobOffer: {
    typeIds: [Id("f60585af71b646749a26b74ca6c1cceb")],
    properties: {
      name: Id("a126ca530c8e48d5b88882c734c38935"),
      salary: Id("baa36ac978ac4cf783946b2d3006bebe")
    },
  },
}`;

    expect(result).toBe(expected);
  });
});
