import { createFunctions, type } from 'graph-framework';

export const schema = {
  types: {
    Person: {
      name: type.Text,
      age: type.Number,
      badge: type.Relation({
        types: ['Badge'] as const,
        cardinality: 'one',
      }),
    },
    User: {
      name: type.Text,
      email: type.Text,
    },
    Badge: {
      name: type.Text,
    },
    Event: {
      name: type.Text,
      participants: type.Relation({
        types: ['Person'] as const,
        cardinality: 'many',
      }),
      author: type.Relation({
        types: ['User', 'Person'] as const,
        cardinality: 'one',
      }),
    },
  },
};

export const { SpaceProvider, useCreateEntity, useDeleteEntity, useSpaceId, createDocumentId, useQuery } =
  createFunctions(schema);
