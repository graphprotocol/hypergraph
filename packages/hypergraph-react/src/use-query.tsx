import type { Entity } from '@graphprotocol/hypergraph';
import { useMemo } from 'react';
import { useHypergraph, useQueryLocal } from './HypergraphSpaceContext.js';
import { generateDeleteOps } from './internal/generate-delete-ops-geo.js';
import { useGenerateCreateOps } from './internal/use-generate-create-ops.js';
import { useGenerateUpdateOps } from './internal/use-generate-update-ops.js';
import { parseResult, useQueryPublic } from './internal/use-query-public-geo.js';
import type { DiffEntry, PublishDiffInfo } from './types.js';

type QueryParams = {
  mode: 'merged' | 'public' | 'local';
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
  publicEntities: Entity.Entity<S>[],
  localEntities: Entity.Entity<S>[],
  localDeletedEntities: Entity.Entity<S>[],
) => {
  const deletedEntities: Entity.Entity<S>[] = [];
  const updatedEntities: { id: string; current: Entity.Entity<S>; next: Entity.Entity<S>; diff: DiffEntry<S> }[] = [];

  for (const entity of publicEntities) {
    const deletedEntity = localDeletedEntities.find((e) => e.id === entity.id);
    if (deletedEntity) {
      deletedEntities.push(deletedEntity);
      continue;
    }
    const localEntity = localEntities.find((e) => e.id === entity.id);
    if (localEntity) {
      // @ts-expect-error TODO: fix this
      const diff: DiffEntry<S> = {};
      for (const key in entity) {
        if (key === '__version') {
          continue;
        }
        if (entity[key] !== localEntity[key]) {
          // @ts-expect-error TODO: fix this
          diff[key] = localEntity[key];
        }
      }
      if (Object.keys(diff).length > 0) {
        updatedEntities.push({ id: entity.id, current: entity, next: localEntity, diff });
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

export function useQuery<const S extends Entity.AnyNoContext>(type: S, params?: QueryParams) {
  const { mode = 'merged' } = params ?? {};
  const publicResult = useQueryPublic(type, { enabled: mode === 'public' || mode === 'merged' });
  const localResult = useQueryLocal(type, { enabled: mode === 'local' || mode === 'merged' });
  const { mapping } = useHypergraph();
  const generateCreateOps = useGenerateCreateOps(type, mode === 'merged');
  const generateUpdateOps = useGenerateUpdateOps(type);

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
      parseResult(result.data, type, mappingEntry, mapping).data,
      localResult.entities,
      localResult.deletedEntities,
    );

    const newEntities = diff.newEntities.map((entity) => {
      const { ops: createOps } = generateCreateOps(entity);
      return { id: entity.id, entity, ops: createOps };
    });

    const updatedEntities = diff.updatedEntities.map((updatedEntityInfo) => {
      const { ops: updateOps } = generateUpdateOps({ ...updatedEntityInfo.diff, id: updatedEntityInfo.id });
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
