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
    return publicResult;
  }

  if (mode === 'local') {
    return {
      ...publicResult,
      data: localResult,
    };
  }

  if (!publicResult.isLoading) {
    const mergedData: Entity.Entity<S>[] = [];

    for (const entity of publicResult.data) {
      const localEntity = localResult.find((e) => e.id === entity.id);
      if (localEntity) {
        if (localEntity.__deleted) {
          continue;
        }
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
    const localEntitiesNotInPublic = localResult.filter(
      (e) => e.__deleted !== true && !publicResult.data.some((p) => p.id === e.id),
    );

    mergedData.push(...localEntitiesNotInPublic);

    return {
      ...publicResult,
      data: mergedData,
    };
  }

  return {
    ...publicResult,
    data: localResult,
  };
}
