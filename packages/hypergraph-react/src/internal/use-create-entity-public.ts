import { Graph, Id, type PropertiesParam, type RelationsParam } from '@graphprotocol/grc-20';
import type { Connect } from '@graphprotocol/hypergraph';
import type { Entity } from '@graphprotocol/hypergraph';
import { Type, store } from '@graphprotocol/hypergraph';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@xstate/store/react';
import type * as Schema from 'effect/Schema';
import { publishOps } from '../publish-ops.js';

type CreateEntityPublicParams = {
  space: string;
};

export function useCreateEntityPublic<const S extends Entity.AnyNoContext>(
  type: S,
  { space }: CreateEntityPublicParams,
) {
  const mapping = useSelector(store, (state) => state.context.mapping);
  const queryClient = useQueryClient();

  return async (
    data: Readonly<Schema.Schema.Type<Entity.Insert<S>>>,
    { walletClient }: { walletClient: Connect.SmartSessionClient },
    // TODO: return the entity with this type: Promise<Entity.Entity<S>>
  ) => {
    try {
      // @ts-expect-error TODO should use the actual type instead of the name in the mapping
      const typeName = type.name;
      const mappingEntry = mapping?.[typeName];
      if (!mappingEntry) {
        throw new Error(`Mapping entry for ${typeName} not found`);
      }

      const fields = type.fields;
      const values: PropertiesParam = [];
      for (const [key, value] of Object.entries(mappingEntry.properties || {})) {
        let serializedValue: string = data[key];
        if (fields[key] === Type.Checkbox) {
          serializedValue = Graph.serializeCheckbox(data[key]);
        } else if (fields[key] === Type.Date) {
          serializedValue = Graph.serializeDate(data[key]);
        } else if (fields[key] === Type.Point) {
          serializedValue = Graph.serializePoint(data[key]);
        } else if (fields[key] === Type.Number) {
          serializedValue = Graph.serializeNumber(data[key]);
        }

        values.push({
          property: Id.Id(value),
          value: serializedValue,
        });
      }

      const relations: RelationsParam = {};
      for (const [key, relationId] of Object.entries(mappingEntry.relations || {})) {
        const toIds: { toEntity: Id.Id }[] = [];

        if (data[key]) {
          // @ts-expect-error - TODO: fix the types error
          for (const entity of data[key]) {
            if (typeof entity === 'string') {
              toIds.push({ toEntity: Id.Id(entity) });
            } else {
              toIds.push({ toEntity: Id.Id(entity.id) });
            }
          }
          relations[Id.Id(relationId)] = toIds;
        }
      }

      const { ops } = Graph.createEntity({
        types: mappingEntry.typeIds,
        id: data.id,
        values,
        relations,
      });

      const { cid, txResult } = await publishOps({
        ops,
        space,
        name: `Create entity ${data.id}`,
        walletClient,
      });
      // TODO: temporary fix until we get the information from the API when a transaction is confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000));
      queryClient.invalidateQueries({
        queryKey: [
          'hypergraph-public-entities',
          // @ts-expect-error - TODO: find a better way to access the type.name
          type.name,
          space,
        ],
      });
      return { success: true, cid, txResult };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to create entity' };
    }
  };
}
