import type { Op } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import { useHypergraph, useQueryLocal } from './HypergraphSpaceContext.js';
import { generateDeleteOps } from './internal/generate-delete-ops-geo.js';
import { useGenerateCreateOps } from './internal/use-generate-create-ops.js';
import { useGenerateUpdateOps } from './internal/use-generate-update-ops.js';
import { parseResult, useQueryPublic } from './internal/use-query-public-geo.js';
import type { DiffEntry } from './types.js';

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
        if (entity[key] !== localEntity[key]) {
          // @ts-expect-error TODO: fix this
          diff[key] = localEntity[key];
        }
      }
      updatedEntities.push({ id: entity.id, current: entity, next: localEntity, diff });
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
  const generateCreateOps = useGenerateCreateOps(type);
  const generateUpdateOps = useGenerateUpdateOps(type);

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

  if (!publicResult.isLoading) {
    const mergedData: Entity.Entity<S>[] = mergeEntities(
      publicResult.data,
      localResult.entities,
      localResult.deletedEntities,
    );

    return {
      ...publicResult,
      data: mergedData,
      deleted: localResult.deletedEntities,
      preparePublish: async () => {
        console.log('preparePublish');
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
        console.log('result', result);
        const diff = getDiff(
          parseResult(result.data, type, mappingEntry).data,
          localResult.entities,
          localResult.deletedEntities,
        );

        let ops: Op[] = [];
        if (diff.newEntities.length > 0) {
          for (const entity of diff.newEntities) {
            const { ops: createOps } = generateCreateOps(entity);
            ops = [...ops, ...createOps];
          }
        }
        if (diff.updatedEntities.length > 0) {
          for (const updatedEntity of diff.updatedEntities) {
            const { ops: updateOps } = generateUpdateOps({ ...updatedEntity.diff, id: updatedEntity.id });
            ops = [...ops, ...updateOps];
          }
        }
        if (diff.deletedEntities.length > 0) {
          for (const entity of diff.deletedEntities) {
            const deleteOps = await generateDeleteOps(entity);
            ops = [...ops, ...deleteOps];
          }
        }

        return { diff, ops };
      },
    };
  }

  return {
    ...publicResult,
    data: localResult.entities,
    deleted: localResult.deletedEntities,
    preparePublish: preparePublishDummy,
  };
}
