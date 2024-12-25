import { createSchemaHooks, type } from '@graphprotocol/graph-framework';

const schema = createSchemaHooks({
  types: {
    Todo: {
      title: type.Text,
      completed: type.Checkbox,
    },
  },
});

export const { useCreateEntity, useDeleteEntity, useQuery } = schema;
