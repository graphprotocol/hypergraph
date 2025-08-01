import { describe, it } from '@effect/vitest';
import { Id } from '@graphprotocol/grc-20';
import { Effect } from 'effect';
import { parseHypergraphMapping, parseSchema } from '../../../src/cli/services/Utils.js';
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
        });

        // Check Todo entity
        const todoEntity = result.types.find((t) => t.name === 'Todo');
        expect(todoEntity).toBeDefined();
        expect(todoEntity?.properties).toHaveLength(3);
        expect(todoEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: null,
        });
        expect(todoEntity?.properties[1]).toMatchObject({
          name: 'completed',
          dataType: 'Boolean',
          knowledgeGraphId: null,
        });
        expect(todoEntity?.properties[2]).toMatchObject({
          name: 'assignees',
          dataType: 'Relation(User)',
          relationType: 'User',
          knowledgeGraphId: null,
        });

        // Check Todo2 entity with various types
        const todo2Entity = result.types.find((t) => t.name === 'Todo2');
        expect(todo2Entity).toBeDefined();
        expect(todo2Entity?.properties).toHaveLength(7);
        expect(todo2Entity?.properties[3]).toMatchObject({
          name: 'due',
          dataType: 'Date',
          knowledgeGraphId: null,
        });
        expect(todo2Entity?.properties[4]).toMatchObject({
          name: 'amount',
          dataType: 'Number',
          knowledgeGraphId: null,
        });
        expect(todo2Entity?.properties[5]).toMatchObject({
          name: 'point',
          dataType: 'Point',
          knowledgeGraphId: null,
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
          typeIds: [Id('7f9562d4-034d-4385-bf5c-f02cdebba47a')],
          properties: {
            name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
          },
          relations: {
            sponsors: Id('6860bfac-f703-4289-b789-972d0aaf3abe'),
          },
        },
        Company: {
          typeIds: [Id('6c504df5-1a8f-43d1-bf2d-1ef9fa5b08b5')],
          properties: {
            name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
          },
          relations: {
            jobOffers: Id('1203064e-9741-4235-89d4-97f4b22eddfb'),
          },
        },
        JobOffer: {
          typeIds: [Id('f60585af-71b6-4674-9a26-b74ca6c1cceb')],
          properties: {
            name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
            salary: Id('baa36ac9-78ac-4cf7-8394-6b2d3006bebe'),
          },
        },
      };

      const result = yield* parseSchema(schemaContent, mapping);

      yield* Effect.sync(() => {
        expect(result.types).toHaveLength(3);

        // Check Event entity with resolved IDs
        const eventEntity = result.types.find((t) => t.name === 'Event');
        expect(eventEntity).toBeDefined();
        expect(eventEntity?.knowledgeGraphId).toBe('7f9562d4-034d-4385-bf5c-f02cdebba47a');
        expect(eventEntity?.properties).toHaveLength(2);
        expect(eventEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: 'a126ca53-0c8e-48d5-b888-82c734c38935',
        });
        expect(eventEntity?.properties[1]).toMatchObject({
          name: 'sponsors',
          dataType: 'Relation(Company)',
          relationType: 'Company',
          knowledgeGraphId: '6860bfac-f703-4289-b789-972d0aaf3abe',
        });

        // Check Company entity with resolved IDs
        const companyEntity = result.types.find((t) => t.name === 'Company');
        expect(companyEntity).toBeDefined();
        expect(companyEntity?.knowledgeGraphId).toBe('6c504df5-1a8f-43d1-bf2d-1ef9fa5b08b5');
        expect(companyEntity?.properties).toHaveLength(2);
        expect(companyEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: 'a126ca53-0c8e-48d5-b888-82c734c38935',
        });
        expect(companyEntity?.properties[1]).toMatchObject({
          name: 'jobOffers',
          dataType: 'Relation(JobOffer)',
          relationType: 'JobOffer',
          knowledgeGraphId: '1203064e-9741-4235-89d4-97f4b22eddfb',
        });

        // Check JobOffer entity with resolved IDs
        const jobOfferEntity = result.types.find((t) => t.name === 'JobOffer');
        expect(jobOfferEntity).toBeDefined();
        expect(jobOfferEntity?.knowledgeGraphId).toBe('f60585af-71b6-4674-9a26-b74ca6c1cceb');
        expect(jobOfferEntity?.properties).toHaveLength(2);
        expect(jobOfferEntity?.properties[0]).toMatchObject({
          name: 'name',
          dataType: 'String',
          knowledgeGraphId: 'a126ca53-0c8e-48d5-b888-82c734c38935',
        });
        expect(jobOfferEntity?.properties[1]).toMatchObject({
          name: 'salary',
          dataType: 'Number',
          knowledgeGraphId: 'baa36ac9-78ac-4cf7-8394-6b2d3006bebe',
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
        typeIds: [Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
        properties: {
          name: Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
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
        typeIds: [Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
      },
    };

    const otherMapping: Mapping = {
      Post: {
        typeIds: [Id('b5fd07b1-120f-46c6-b46f-387ef98396a6')],
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
        typeIds: [Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
      },
    };

    const otherMapping: Mapping = {
      Post: {
        typeIds: [Id('b5fd07b1-120f-46c6-b46f-387ef98396a6')],
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
        typeIds: [Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
      },
    };

    const otherMapping: Mapping = {
      Post: {
        typeIds: [Id('b5fd07b1-120f-46c6-b46f-387ef98396a6')],
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
        typeIds: [Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
      },
    };

    const secondMapping: Mapping = {
      Post: {
        typeIds: [Id('b5fd07b1-120f-46c6-b46f-387ef98396a6')],
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
        typeIds: [Id('7f9562d4-034d-4385-bf5c-f02cdebba47a')],
        properties: {
          name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
        },
        relations: {
          sponsors: Id('6860bfac-f703-4289-b789-972d0aaf3abe'),
        },
      },
      Company: {
        typeIds: [Id('6c504df5-1a8f-43d1-bf2d-1ef9fa5b08b5')],
        properties: {
          name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
        },
        relations: {
          jobOffers: Id('1203064e-9741-4235-89d4-97f4b22eddfb'),
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
          name: Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
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
          name: Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
        },
      },
    };

    const moduleExport = { mapping: invalidMapping };
    const result = parseHypergraphMapping(moduleExport);
    expect(result).toEqual({});
  });
});
