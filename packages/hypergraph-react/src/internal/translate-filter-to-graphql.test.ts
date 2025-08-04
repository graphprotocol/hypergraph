import { Graph, Id } from '@graphprotocol/grc-20';
import { Entity, type Mapping, Type } from '@graphprotocol/hypergraph';
import { describe, expect, it } from 'vitest';
import { translateFilterToGraphql } from './translate-filter-to-graphql.js';

export class Todo extends Entity.Class<Todo>('Todo')({
  name: Type.String,
  completed: Type.Boolean,
  priority: Type.Number,
}) {}

const mapping: Mapping.Mapping = {
  Todo: {
    typeIds: [Id('a288444f-06a3-4037-9ace-66fe325864d0')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      completed: Id('d2d64cd3-a337-4784-9e30-25bea0349471'),
      priority: Id('ee920534-42ce-4113-a63b-8f3c889dd772'),
    },
  },
};

describe('translateFilterToGraphql string filters', () => {
  it('should translate string `is` filter correctly', () => {
    const filter: Entity.EntityFilter<Todo> = {
      name: { is: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' },
          string: { is: 'test' },
        },
      },
    });
  });

  it('should translate string `contains` filter correctly', () => {
    const filter: Entity.EntityFilter<Todo> = {
      name: { contains: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' },
          string: { includes: 'test' },
        },
      },
    });
  });

  it('should translate string `startsWith` filter correctly', () => {
    const filter: Entity.EntityFilter<Todo> = {
      name: { startsWith: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' },
          string: { startsWith: 'test' },
        },
      },
    });
  });

  it('should translate string `endsWith` filter correctly', () => {
    const filter: Entity.EntityFilter<Todo> = {
      name: { endsWith: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' },
          string: { endsWith: 'test' },
        },
      },
    });
  });
});

describe('translateFilterToGraphql boolean filters', () => {
  it('should translate boolean `is` filter correctly', () => {
    const filter: Entity.EntityFilter<Todo> = {
      completed: { is: true },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'd2d64cd3-a337-4784-9e30-25bea0349471' },
          boolean: { is: true },
        },
      },
    });
  });
});

describe('translateFilterToGraphql number filters', () => {
  it('should translate number `is` filter correctly', () => {
    const filter: Entity.EntityFilter<Todo> = {
      priority: { is: 1 },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'ee920534-42ce-4113-a63b-8f3c889dd772' },
          number: { is: Graph.serializeNumber(1) },
        },
      },
    });
  });

  it('should translate number `greaterThan` filter correctly', () => {
    const filter: Entity.EntityFilter<Todo> = {
      priority: { greaterThan: 1 },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'ee920534-42ce-4113-a63b-8f3c889dd772' },
          number: { greaterThan: Graph.serializeNumber(1) },
        },
      },
    });
  });
});

describe('translateFilterToGraphql multiple filters', () => {
  it('should translate multiple filters correctly', () => {
    const filter: Entity.EntityFilter<Todo> = {
      name: { is: 'test' },
      completed: { is: true },
      priority: { greaterThan: 1 },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      and: [
        {
          values: {
            some: {
              propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' },
              string: { is: 'test' },
            },
          },
        },
        {
          values: {
            some: {
              propertyId: { is: 'd2d64cd3-a337-4784-9e30-25bea0349471' },
              boolean: { is: true },
            },
          },
        },
        {
          values: {
            some: {
              propertyId: { is: 'ee920534-42ce-4113-a63b-8f3c889dd772' },
              number: { greaterThan: Graph.serializeNumber(1) },
            },
          },
        },
      ],
    });
  });
});

describe('translateFilterToGraphql with OR operator', () => {
  it('should translate OR operator in nested filter array', () => {
    const filter: Entity.EntityFilter<Todo> = {
      or: [{ name: { is: 'test' } }, { name: { is: 'test2' } }],
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      or: [
        {
          values: { some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'test' } } },
        },
        {
          values: { some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'test2' } } },
        },
      ],
    });
  });

  it('should translate OR operator in nested filter array', () => {
    const filter: Entity.EntityFilter<Todo> = {
      or: [{ name: { is: 'test' } }, { completed: { is: true } }],
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      or: [
        {
          values: { some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'test' } } },
        },
        {
          values: { some: { propertyId: { is: 'd2d64cd3-a337-4784-9e30-25bea0349471' }, boolean: { is: true } } },
        },
      ],
    });
  });
});

describe('translateFilterToGraphql with NOT operator', () => {
  it('should translate NOT operator', () => {
    const filter: Entity.EntityFilter<Todo> = {
      not: { name: { is: 'test' } },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      not: { values: { some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'test' } } } },
    });
  });

  it('should translate NOT operator with multiple filters', () => {
    const filter: Entity.EntityFilter<Todo> = {
      not: { name: { is: 'test' }, completed: { is: true } },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      not: {
        and: [
          { values: { some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'test' } } } },
          { values: { some: { propertyId: { is: 'd2d64cd3-a337-4784-9e30-25bea0349471' }, boolean: { is: true } } } },
        ],
      },
    });
  });
});

describe('translateFilterToGraphql with complex nested filters', () => {
  it('should translate complex nested filters with or and not', () => {
    const filter: Entity.EntityFilter<Todo> = {
      or: [{ not: { name: { is: 'Jane Doe' } } }, { not: { name: { is: 'John Doe' } } }],
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      or: [
        {
          not: {
            values: {
              some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'Jane Doe' } },
            },
          },
        },
        {
          not: {
            values: {
              some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'John Doe' } },
            },
          },
        },
      ],
    });
  });

  it('should translate complex nested filters with and, or and not', () => {
    const filter: Entity.EntityFilter<Todo> = {
      priority: {
        is: 42,
      },
      or: [{ not: { name: { is: 'Jane Doe' } } }, { not: { name: { is: 'John Doe' } } }],
      not: {
        or: [{ name: { is: 'Jane Doe' } }, { name: { is: 'John Doe' } }],
      },
    };

    const result = translateFilterToGraphql(filter, Todo, mapping);

    expect(result).toEqual({
      and: [
        {
          values: {
            some: {
              propertyId: { is: 'ee920534-42ce-4113-a63b-8f3c889dd772' },
              number: { is: Graph.serializeNumber(42) },
            },
          },
        },
        {
          or: [
            {
              not: {
                values: {
                  some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'Jane Doe' } },
                },
              },
            },
            {
              not: {
                values: {
                  some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'John Doe' } },
                },
              },
            },
          ],
        },
        {
          not: {
            or: [
              {
                values: {
                  some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'Jane Doe' } },
                },
              },
              {
                values: {
                  some: { propertyId: { is: 'a126ca53-0c8e-48d5-b888-82c734c38935' }, string: { is: 'John Doe' } },
                },
              },
            ],
          },
        },
      ],
    });
  });
});
