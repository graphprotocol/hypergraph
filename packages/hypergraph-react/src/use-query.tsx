import type { Entity } from '@graphprotocol/hypergraph';
import { useQueryLocal } from './HypergraphSpaceContext.js';
import { useQueryPublic } from './internal/use-query-public-geo.js';

type QueryParams = {
  mode: 'merged' | 'public' | 'local';
};

export function useQuery<const S extends Entity.AnyNoContext>(type: S, params?: QueryParams) {
  const { mode = 'merged' } = params ?? {};
  const publicResult = useQueryPublic(type, { enabled: mode === 'public' || mode === 'merged' });
  const localResult = useQueryLocal(type, { enabled: mode === 'local' || mode === 'merged' });

  if (mode === 'public') {
    return {
      ...publicResult,
      deleted: [],
    };
  }

  if (mode === 'local') {
    return {
      ...publicResult,
      data: localResult.entities,
      deleted: localResult.deletedEntities,
    };
  }

  if (!publicResult.isLoading) {
    const mergedData: Entity.Entity<S>[] = [];

    for (const entity of publicResult.data) {
      const deletedEntity = localResult.deletedEntities.find((e) => e.id === entity.id);
      if (deletedEntity) {
        continue;
      }
      const localEntity = localResult.entities.find((e) => e.id === entity.id);
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
    const localEntitiesNotInPublic = localResult.entities.filter((e) => !publicResult.data.some((p) => p.id === e.id));

    mergedData.push(...localEntitiesNotInPublic);

    return {
      ...publicResult,
      data: mergedData,
      deleted: localResult.deletedEntities,
    };
  }

  return {
    ...publicResult,
    data: localResult.entities,
    deleted: localResult.deletedEntities,
  };
}
