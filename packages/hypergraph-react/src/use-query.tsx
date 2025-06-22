import { type Entity, Type, Utils, store } from '@graphprotocol/hypergraph';
import { useSelector } from '@xstate/store/react';
import type * as Schema from 'effect/Schema';
import { useMemo } from 'react';
import { useQueryLocal } from './HypergraphSpaceContext.js';
import { generateDeleteOps } from './internal/generate-delete-ops.js';
import { useGenerateCreateOps } from './internal/use-generate-create-ops.js';
import { useGenerateUpdateOps } from './internal/use-generate-update-ops.js';
import { parseResult, useQueryPublic } from './internal/use-query-public.js';
import type { DiffEntry, PublishDiffInfo } from './types.js';

type QueryParams<S extends Entity.AnyNoContext> = {
  mode?: 'merged' | 'public' | 'local';
  filter?: { [K in keyof Schema.Schema.Type<S>]?: Entity.EntityFieldFilter<Schema.Schema.Type<S>[K]> } | undefined;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
};

const mergeEntities = <S extends Entity.AnyNoContext>(
  publicEntities: Entity.Entity<S>[],
  localEntities: Entity.Entity<S>[],
  localDeletedEntities: Entity.Entity<S>[],
) => {
  const mergedData: Entity.Entity<S>[] = [];

  for (const entity of publicEntities) {
    const deletedEntity = localDeletedEntities.find((e) => e.id === entity.id);
    if (deletedEntity) {
      continue;
    }
    const localEntity = localEntities.find((e) => e.id === entity.id);
    if (localEntity) {
      const mergedEntity = { ...entity };
      for (const key in entity) {
        mergedEntity[key] = localEntity[key];
      }
      mergedData.push(mergedEntity);
    } else {
      mergedData.push(entity);
    }
  }

  // find all local entities that are not in the public result
  const localEntitiesNotInPublic = localEntities.filter((e) => !publicEntities.some((p) => p.id === e.id));

  mergedData.push(...localEntitiesNotInPublic);
  return mergedData;
};

const getDiff = <S extends Entity.AnyNoContext>(
  type: S,
  publicEntities: Entity.Entity<S>[],
  localEntities: Entity.Entity<S>[],
  localDeletedEntities: Entity.Entity<S>[],
) => {
  const deletedEntities: Entity.Entity<S>[] = [];
  const updatedEntities: { id: string; current: Entity.Entity<S>; new: Entity.Entity<S>; diff: DiffEntry }[] = [];

  for (const entity of publicEntities) {
    const deletedEntity = localDeletedEntities.find((e) => e.id === entity.id);
    if (deletedEntity) {
      deletedEntities.push(deletedEntity);
      continue;
    }
    const localEntity = localEntities.find((e) => e.id === entity.id);
    if (localEntity) {
      const diff: DiffEntry = {};

      for (const [key, field] of Object.entries(type.fields)) {
        if (key === '__version' || key === '__deleted') {
          continue;
        }

        if (Utils.isRelationField(field)) {
          const relationIds: string[] = entity[key].map((e: Entity.Entity<S>) => e.id);
          const localRelationIds: string[] = localEntity[key].map((e: Entity.Entity<S>) => e.id);
          if (
            relationIds.length !== localRelationIds.length ||
            relationIds.some((id) => !localRelationIds.includes(id))
          ) {
            const removedIds = relationIds.filter((id) => !localRelationIds.includes(id));
            const addedIds = localRelationIds.filter((id) => !relationIds.includes(id));
            // get a list of the ids that didn't get added or removed
            const unchangedIds = localRelationIds.filter((id) => !addedIds.includes(id) && !removedIds.includes(id));
            diff[key] = {
              type: 'relation',
              current: entity[key],
              new: localEntity[key],
              addedIds,
              removedIds,
              unchangedIds,
            };
          }
        } else {
          if (field === Type.Date) {
            if (entity[key].getTime() !== localEntity[key].getTime()) {
              diff[key] = {
                type: 'property',
                current: entity[key],
                new: localEntity[key],
              };
            }
          } else if (field === Type.Url) {
            if (entity[key].toString() !== localEntity[key].toString()) {
              diff[key] = {
                type: 'property',
                current: entity[key],
                new: localEntity[key],
              };
            }
          } else if (field === Type.Point) {
            if (entity[key].join(',') !== localEntity[key].join(',')) {
              diff[key] = {
                type: 'property',
                current: entity[key],
                new: localEntity[key],
              };
            }
          } else if (entity[key] !== localEntity[key]) {
            diff[key] = {
              type: 'property',
              current: entity[key],
              new: localEntity[key],
            };
          }
        }
      }

      if (Object.keys(diff).length > 0) {
        updatedEntities.push({ id: entity.id, current: entity, new: localEntity, diff });
      }
    } else {
      // TODO update the local entity in this place?
    }
  }

  const newEntities = localEntities.filter((e) => !publicEntities.some((p) => p.id === e.id));

  return {
    newEntities,
    deletedEntities,
    updatedEntities,
  };
};

const preparePublishDummy = () => undefined;

export function useQuery<const S extends Entity.AnyNoContext>(type: S, params?: QueryParams<S>) {
  const { mode = 'merged', filter, include } = params ?? {};
  const publicResult = useQueryPublic(type, { enabled: mode === 'public' || mode === 'merged', include });
  const localResult = useQueryLocal(type, { enabled: mode === 'local' || mode === 'merged', filter, include });
  const mapping = useSelector(store, (state) => state.context.mapping);
  const generateCreateOps = useGenerateCreateOps(type, mode === 'merged');
  const generateUpdateOps = useGenerateUpdateOps(type, mode === 'merged');

  const mergedData = useMemo(() => {
    if (mode !== 'merged' || publicResult.isLoading) {
      return localResult.entities;
    }
    return mergeEntities(publicResult.data, localResult.entities, localResult.deletedEntities);
  }, [mode, publicResult.isLoading, publicResult.data, localResult.entities, localResult.deletedEntities]);

  if (mode === 'public') {
    return {
      ...publicResult,
      deleted: [],
      preparePublish: preparePublishDummy,
    };
  }

  if (mode === 'local') {
    return {
      ...publicResult,
      data: localResult.entities,
      deleted: localResult.deletedEntities,
      preparePublish: preparePublishDummy,
    };
  }

  const preparePublish = async (): Promise<PublishDiffInfo> => {
    // @ts-expect-error TODO should use the actual type instead of the name in the mapping
    const typeName = type.name;
    const mappingEntry = mapping?.[typeName];
    if (!mappingEntry) {
      throw new Error(`Mapping entry for ${typeName} not found`);
    }

    const result = await publicResult.refetch();
    if (!result.data) {
      throw new Error('No data found');
    }
    const diff = getDiff(
      type,
      parseResult(result.data, type, mappingEntry, mapping).data,
      localResult.entities,
      localResult.deletedEntities,
    );

    const newEntities = diff.newEntities.map((entity) => {
      const { ops: createOps } = generateCreateOps(entity);
      return { id: entity.id, entity, ops: createOps };
    });

    const updatedEntities = diff.updatedEntities.map((updatedEntityInfo) => {
      const { ops: updateOps } = generateUpdateOps({ id: updatedEntityInfo.id, diff: updatedEntityInfo.diff });
      return { ...updatedEntityInfo, ops: updateOps };
    });

    const deletedEntities = await Promise.all(
      diff.deletedEntities.map(async (entity) => {
        const deleteOps = await generateDeleteOps(entity);
        return { id: entity.id, entity, ops: deleteOps };
      }),
    );

    return { newEntities, updatedEntities, deletedEntities };
  };

  return {
    ...publicResult,
    data: mergedData,
    deleted: localResult.deletedEntities,
    preparePublish: !publicResult.isLoading ? preparePublish : preparePublishDummy,
  };
}
