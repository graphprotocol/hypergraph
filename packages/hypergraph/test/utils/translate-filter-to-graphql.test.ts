import { Graph, Id } from '@graphprotocol/grc-20';
import { Entity, Type } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { describe, expect, it } from 'vitest';
import { translateFilterToGraphql } from '../../src/utils/translate-filter-to-graphql.js';

export const User = Entity.Schema(
  {
    username: Type.String,
  },
  {
    types: [Id('f6fa5a6a7dbf4c31aba57b4cd0a9b2de')],
    properties: {
      username: Id('f0dfb5c03c904d3098a36a139c8b5943'),
    },
  },
);

export const Todo = Entity.Schema(
  {
    name: Type.String,
    completed: Type.Boolean,
    priority: Type.Number,
    assignees: Type.Relation(User),
  },
  {
    types: [Id('a288444f06a340379ace66fe325864d0')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      completed: Id('d2d64cd3a33747849e3025bea0349471'),
      priority: Id('ee92053442ce4113a63b8f3c889dd772'),
      assignees: Id('f399677c2bf940c39622815be7b83344'),
    },
  },
);

type TodoFilter = Entity.EntityFilter<Schema.Schema.Type<typeof Todo>>;

describe('translateFilterToGraphql string filters', () => {
  it('should translate string `is` filter correctly', () => {
    const filter: TodoFilter = {
      name: { is: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' },
          string: { is: 'test' },
        },
      },
    });
  });

  it('should translate string `contains` filter correctly', () => {
    const filter: TodoFilter = {
      name: { contains: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' },
          string: { includes: 'test' },
        },
      },
    });
  });

  it('should translate string `startsWith` filter correctly', () => {
    const filter: TodoFilter = {
      name: { startsWith: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' },
          string: { startsWith: 'test' },
        },
      },
    });
  });

  it('should translate string `endsWith` filter correctly', () => {
    const filter: TodoFilter = {
      name: { endsWith: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' },
          string: { endsWith: 'test' },
        },
      },
    });
  });
});

describe('translateFilterToGraphql boolean filters', () => {
  it('should translate boolean `is` filter correctly', () => {
    const filter: TodoFilter = {
      completed: { is: true },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'd2d64cd3a33747849e3025bea0349471' },
          boolean: { is: true },
        },
      },
    });
  });
});

describe('translateFilterToGraphql number filters', () => {
  it('should translate number `is` filter correctly', () => {
    const filter: TodoFilter = {
      priority: { is: 1 },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'ee92053442ce4113a63b8f3c889dd772' },
          number: { is: Graph.serializeNumber(1) },
        },
      },
    });
  });

  it('should translate number `greaterThan` filter correctly', () => {
    const filter: TodoFilter = {
      priority: { greaterThan: 1 },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      values: {
        some: {
          propertyId: { is: 'ee92053442ce4113a63b8f3c889dd772' },
          number: { greaterThan: Graph.serializeNumber(1) },
        },
      },
    });
  });
});

describe('translateFilterToGraphql id filters', () => {
  it('should translate id `is` filter correctly', () => {
    const filter: TodoFilter = {
      id: { is: 'entity-id' },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      id: { is: 'entity-id' },
    });
  });

  it('should combine id filter with other property filters', () => {
    const filter: TodoFilter = {
      id: { is: 'entity-id' },
      name: { is: 'test' },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      and: [
        { id: { is: 'entity-id' } },
        {
          values: {
            some: {
              propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' },
              string: { is: 'test' },
            },
          },
        },
      ],
    });
  });
});

describe('translateFilterToGraphql relation filters', () => {
  it('should translate relation `exists` filter correctly', () => {
    const filter: TodoFilter = {
      // @ts-expect-error - this is a test
      assignees: { exists: true },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      relations: {
        some: {
          typeId: { is: 'f399677c2bf940c39622815be7b83344' },
        },
      },
    });
  });

  it('should translate relation `exists: false` filter correctly', () => {
    const filter: TodoFilter = {
      // @ts-expect-error - this is a test
      assignees: { exists: false },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      not: {
        relations: {
          some: {
            typeId: { is: 'f399677c2bf940c39622815be7b83344' },
          },
        },
      },
    });
  });
});

describe('translateFilterToGraphql multiple filters', () => {
  it('should translate multiple filters correctly', () => {
    const filter: TodoFilter = {
      name: { is: 'test' },
      completed: { is: true },
      priority: { greaterThan: 1 },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      and: [
        {
          values: {
            some: {
              propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' },
              string: { is: 'test' },
            },
          },
        },
        {
          values: {
            some: {
              propertyId: { is: 'd2d64cd3a33747849e3025bea0349471' },
              boolean: { is: true },
            },
          },
        },
        {
          values: {
            some: {
              propertyId: { is: 'ee92053442ce4113a63b8f3c889dd772' },
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
    const filter: TodoFilter = {
      or: [{ name: { is: 'test' } }, { name: { is: 'test2' } }],
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      or: [
        {
          values: { some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'test' } } },
        },
        {
          values: { some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'test2' } } },
        },
      ],
    });
  });

  it('should translate OR operator in nested filter array', () => {
    const filter: TodoFilter = {
      or: [{ name: { is: 'test' } }, { completed: { is: true } }],
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      or: [
        {
          values: { some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'test' } } },
        },
        {
          values: { some: { propertyId: { is: 'd2d64cd3a33747849e3025bea0349471' }, boolean: { is: true } } },
        },
      ],
    });
  });
});

describe('translateFilterToGraphql with NOT operator', () => {
  it('should translate NOT operator', () => {
    const filter: TodoFilter = {
      not: { name: { is: 'test' } },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      not: { values: { some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'test' } } } },
    });
  });

  it('should translate NOT operator with multiple filters', () => {
    const filter: TodoFilter = {
      not: { name: { is: 'test' }, completed: { is: true } },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      not: {
        and: [
          { values: { some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'test' } } } },
          { values: { some: { propertyId: { is: 'd2d64cd3a33747849e3025bea0349471' }, boolean: { is: true } } } },
        ],
      },
    });
  });
});

describe('translateFilterToGraphql with complex nested filters', () => {
  it('should translate complex nested filters with or and not', () => {
    const filter: TodoFilter = {
      or: [{ not: { name: { is: 'Jane Doe' } } }, { not: { name: { is: 'John Doe' } } }],
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      or: [
        {
          not: {
            values: {
              some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'Jane Doe' } },
            },
          },
        },
        {
          not: {
            values: {
              some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'John Doe' } },
            },
          },
        },
      ],
    });
  });

  it('should translate complex nested filters with and, or and not', () => {
    const filter: TodoFilter = {
      priority: {
        is: 42,
      },
      or: [{ not: { name: { is: 'Jane Doe' } } }, { not: { name: { is: 'John Doe' } } }],
      not: {
        or: [{ name: { is: 'Jane Doe' } }, { name: { is: 'John Doe' } }],
      },
    };

    const result = translateFilterToGraphql(filter, Todo);

    expect(result).toEqual({
      and: [
        {
          values: {
            some: {
              propertyId: { is: 'ee92053442ce4113a63b8f3c889dd772' },
              number: { is: Graph.serializeNumber(42) },
            },
          },
        },
        {
          or: [
            {
              not: {
                values: {
                  some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'Jane Doe' } },
                },
              },
            },
            {
              not: {
                values: {
                  some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'John Doe' } },
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
                  some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'Jane Doe' } },
                },
              },
              {
                values: {
                  some: { propertyId: { is: 'a126ca530c8e48d5b88882c734c38935' }, string: { is: 'John Doe' } },
                },
              },
            ],
          },
        },
      ],
    });
  });
});
