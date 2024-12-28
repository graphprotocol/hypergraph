import { createSchemaHooks, type } from '@graphprotocol/graph-framework';

export const { useCreateEntity, useDeleteEntity, useQuery, useUpdateEntity } = createSchemaHooks({
  types: {
    Todo: {
      title: type.Text,
      completed: type.Checkbox,
    },
  },
});
