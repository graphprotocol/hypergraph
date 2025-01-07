import { createSchemaHooks, type } from '@graphprotocol/graph-framework';

export const { useCreateEntity, useDeleteEntity, useQuery, useUpdateEntity } = createSchemaHooks({
  Todo: {
    name: type.Text,
    completed: type.Checkbox,
  },
});
