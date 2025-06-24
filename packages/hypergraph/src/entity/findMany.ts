import type { DocHandle, Patch } from '@automerge/automerge-repo';
import * as Schema from 'effect/Schema';
import { deepMerge } from '../utils/internal/deep-merge.js';
import { isRelationField } from '../utils/isRelationField.js';
import { canonicalize } from '../utils/jsc.js';
import { type DecodedEntitiesCacheEntry, type QueryEntry, decodedEntitiesCache } from './decodedEntitiesCache.js';
import { entityRelationParentsMap } from './entityRelationParentsMap.js';
import { getEntityRelations } from './getEntityRelations.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import type {
  AnyNoContext,
  CrossFieldFilter,
  DocumentContent,
  Entity,
  EntityFieldFilter,
  EntityFilter,
  EntityNumberFilter,
  EntityTextFilter,
} from './types.js';

const documentChangeListener: {
  subscribedQueriesCount: number;
  unsubscribe: undefined | (() => void);
} = {
  subscribedQueriesCount: 0,
  unsubscribe: undefined,
};

const subscribeToDocumentChanges = (handle: DocHandle<DocumentContent>) => {
  const onChange = ({ patches, doc }: { patches: Array<Patch>; doc: DocumentContent }) => {
    const changedRelations = new Set<string>();
    const deletedRelations = new Set<string>();
    const changedEntities = new Set<string>();
    const deletedEntities = new Set<string>();

    for (const patch of patches) {
      switch (patch.action) {
        case 'put':
        case 'insert':
        case 'splice': {
          if (patch.path.length > 2 && patch.path[0] === 'entities' && typeof patch.path[1] === 'string') {
            changedEntities.add(patch.path[1]);
          }
          if (patch.path.length > 2 && patch.path[0] === 'relations' && typeof patch.path[1] === 'string') {
            changedRelations.add(patch.path[1]);
          }
          break;
        }
        case 'del': {
          if (patch.path.length === 2 && patch.path[0] === 'entities' && typeof patch.path[1] === 'string') {
            deletedEntities.add(patch.path[1]);
          }
          if (patch.path.length === 2 && patch.path[0] === 'relations' && typeof patch.path[1] === 'string') {
            deletedRelations.add(patch.path[1]);
          }
          break;
        }
      }
    }

    const entityTypes = new Set<string>();
    // collect all query entries that changed and only at the end make one copy to change the
    // reference to reduce the amount of O(n) operations per query to 1
    const touchedQueries = new Set<Array<string>>();

    // collect all entities that used this entity as a entry in on of their relation fields
    const touchedRelationParents = new Set<DecodedEntitiesCacheEntry>();

    // loop over all changed entities and update the cache
    for (const entityId of changedEntities) {
      const entity = doc.entities?.[entityId];
      if (!hasValidTypesProperty(entity)) continue;
      for (const typeName of entity['@@types@@']) {
        if (typeof typeName !== 'string') continue;
        const cacheEntry = decodedEntitiesCache.get(typeName);
        if (!cacheEntry) continue;

        let includeFromAllQueries = {};
        for (const [, query] of cacheEntry.queries) {
          includeFromAllQueries = deepMerge(includeFromAllQueries, query.include);
        }

        const oldDecodedEntry = cacheEntry.entities.get(entityId);
        const relations = getEntityRelations(entityId, cacheEntry.type, doc, includeFromAllQueries);
        let decoded: unknown | undefined;
        try {
          decoded = cacheEntry.decoder({
            ...entity,
            ...relations,
            id: entityId,
          });
          cacheEntry.entities.set(entityId, decoded);
        } catch (error) {
          // TODO: store the corrupt entity ids somewhere, so they can be read via the API
          console.error('error', error);
        }

        if (oldDecodedEntry) {
          // collect all the Ids for relation entries in the `oldDecodedEntry`
          const deletedRelationIds = new Set<string>();
          for (const [, value] of Object.entries(oldDecodedEntry)) {
            if (Array.isArray(value)) {
              for (const relationEntity of value) {
                deletedRelationIds.add(relationEntity.id);
              }
            }
          }

          // it's fine to remove all of them since they are re-added below
          for (const deletedRelationId of deletedRelationIds) {
            const deletedRelationEntry = entityRelationParentsMap.get(deletedRelationId);
            if (deletedRelationEntry) {
              deletedRelationEntry.set(cacheEntry, (deletedRelationEntry.get(cacheEntry) ?? 0) - 1);
              if (deletedRelationEntry.get(cacheEntry) === 0) {
                deletedRelationEntry.delete(cacheEntry);
              }
              if (deletedRelationEntry.size === 0) {
                entityRelationParentsMap.delete(deletedRelationId);
              }
            }
          }
        }

        if (decoded) {
          for (const [, value] of Object.entries(decoded)) {
            if (Array.isArray(value)) {
              for (const relationEntity of value) {
                let relationParentEntry = entityRelationParentsMap.get(relationEntity.id);
                if (relationParentEntry) {
                  relationParentEntry.set(cacheEntry, (relationParentEntry.get(cacheEntry) ?? 0) + 1);
                } else {
                  relationParentEntry = new Map();
                  entityRelationParentsMap.set(relationEntity.id, relationParentEntry);
                  relationParentEntry.set(cacheEntry, 1);
                }
              }
            }
          }
        }

        for (const [queryKey, query] of cacheEntry.queries) {
          touchedQueries.add([typeName, queryKey]);
          query.isInvalidated = true;
        }

        entityTypes.add(typeName);

        // gather all the decodedEntitiesCacheEntries that have a relation to this entity to
        // invoke their query listeners below
        if (entityRelationParentsMap.has(entityId)) {
          const decodedEntitiesCacheEntries = entityRelationParentsMap.get(entityId);
          if (!decodedEntitiesCacheEntries) return;

          for (const [entry] of decodedEntitiesCacheEntries) {
            touchedRelationParents.add(entry);
          }
        }
      }
    }

    // loop over all deleted entities and remove them from the cache
    for (const entityId of deletedEntities) {
      for (const [affectedTypeName, cacheEntry] of decodedEntitiesCache) {
        if (cacheEntry.entities.has(entityId)) {
          entityTypes.add(affectedTypeName);
          cacheEntry.entities.delete(entityId);

          for (const [queryKey, query] of cacheEntry.queries) {
            // find the entity in the query and remove it using splice
            const index = query.data.findIndex((entity) => entity.id === entityId);
            if (index !== -1) {
              query.data.splice(index, 1);
              touchedQueries.add([affectedTypeName, queryKey]);
            }
          }
        }
      }

      // gather all the queries of impacted parent relation queries and then remove the cacheEntry
      if (entityRelationParentsMap.has(entityId)) {
        const decodedEntitiesCacheEntries = entityRelationParentsMap.get(entityId);
        if (!decodedEntitiesCacheEntries) return;

        for (const [entry] of decodedEntitiesCacheEntries) {
          touchedRelationParents.add(entry);
        }

        entityRelationParentsMap.delete(entityId);
      }
    }

    // update the queries affected queries
    for (const [typeName, queryKey] of touchedQueries) {
      const cacheEntry = decodedEntitiesCache.get(typeName);
      if (!cacheEntry) continue;

      const query = cacheEntry.queries.get(queryKey);
      if (!query) continue;

      query.data = [...query.data]; // must be a new reference for React.useSyncExternalStore
    }

    // invoke all the listeners per type
    for (const typeName of entityTypes) {
      const cacheEntry = decodedEntitiesCache.get(typeName);
      if (!cacheEntry) continue;

      for (const query of cacheEntry.queries.values()) {
        for (const listener of query.listeners) {
          listener();
        }
      }
    }

    // trigger all the listeners of the parent relation queries
    for (const decodedEntitiesCacheEntry of touchedRelationParents) {
      decodedEntitiesCacheEntry.isInvalidated = true;
      for (const query of decodedEntitiesCacheEntry.queries.values()) {
        query.isInvalidated = true;
        for (const listener of query.listeners) {
          listener();
        }
      }
    }
  };

  handle.on('change', onChange);

  return () => {
    handle.off('change', onChange);
    decodedEntitiesCache.clear(); // currently we only support exactly one space
  };
};

/**
 * Queries for a list of entities of the given type from the repo.
 */
export function findMany<const S extends AnyNoContext>(
  handle: DocHandle<DocumentContent>,
  type: S,
  filter: EntityFilter<Schema.Schema.Type<S>> | undefined,
  include: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined,
): { entities: Readonly<Array<Entity<S>>>; corruptEntityIds: Readonly<Array<string>> } {
  const decode = Schema.decodeUnknownSync(type);
  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;

  const doc = handle.doc();
  if (!doc) {
    return { entities: [], corruptEntityIds: [] };
  }
  const entities = doc.entities ?? {};
  const corruptEntityIds: string[] = [];
  const filtered: Array<Entity<S>> = [];

  const evaluateFilter = <T>(fieldFilter: EntityFieldFilter<T>, fieldValue: T): boolean => {
    // Handle NOT operator
    if ('not' in fieldFilter && fieldFilter.not) {
      return !evaluateFilter(fieldFilter.not, fieldValue);
    }

    // Handle OR operator
    if ('or' in fieldFilter) {
      const orFilters = fieldFilter.or;
      if (Array.isArray(orFilters)) {
        return orFilters.some((orFilter) => evaluateFilter(orFilter as EntityFieldFilter<T>, fieldValue));
      }
    }

    // Handle basic filters
    if ('is' in fieldFilter) {
      if (typeof fieldValue === 'boolean') {
        return fieldValue === fieldFilter.is;
      }
      if (typeof fieldValue === 'number') {
        return fieldValue === fieldFilter.is;
      }
      if (typeof fieldValue === 'string') {
        return fieldValue === fieldFilter.is;
      }
    }

    if (typeof fieldValue === 'number') {
      if ('greaterThan' in fieldFilter) {
        const numberFilter = fieldFilter as EntityNumberFilter;
        if (numberFilter.greaterThan !== undefined && fieldValue <= numberFilter.greaterThan) {
          return false;
        }
      }
      if ('lessThan' in fieldFilter) {
        const numberFilter = fieldFilter as EntityNumberFilter;
        if (numberFilter.lessThan !== undefined && fieldValue >= numberFilter.lessThan) {
          return false;
        }
      }
    }

    if (typeof fieldValue === 'string') {
      if ('startsWith' in fieldFilter) {
        const textFilter = fieldFilter as EntityTextFilter;
        if (textFilter.startsWith !== undefined && !fieldValue.startsWith(textFilter.startsWith)) {
          return false;
        }
      }
      if ('endsWith' in fieldFilter) {
        const textFilter = fieldFilter as EntityTextFilter;
        if (textFilter.endsWith !== undefined && !fieldValue.endsWith(textFilter.endsWith)) {
          return false;
        }
      }
      if ('contains' in fieldFilter) {
        const textFilter = fieldFilter as EntityTextFilter;
        if (textFilter.contains !== undefined && !fieldValue.includes(textFilter.contains)) {
          return false;
        }
      }
    }

    return true;
  };

  const evaluateCrossFieldFilter = (
    crossFieldFilter: CrossFieldFilter<Schema.Schema.Type<S>>,
    entity: Entity<S>,
  ): boolean => {
    for (const fieldName in crossFieldFilter) {
      const fieldFilter = crossFieldFilter[fieldName];
      const fieldValue = entity[fieldName];

      if (fieldFilter && !evaluateFilter(fieldFilter, fieldValue)) {
        return false;
      }
    }
    return true;
  };

  const evaluateEntityFilter = (entityFilter: EntityFilter<Schema.Schema.Type<S>>, entity: Entity<S>): boolean => {
    // handle top-level NOT operator
    if ('not' in entityFilter && entityFilter.not) {
      return !evaluateCrossFieldFilter(entityFilter.not, entity);
    }

    // handle top-level OR operator
    if ('or' in entityFilter && Array.isArray(entityFilter.or)) {
      return entityFilter.or.some((orFilter) => evaluateCrossFieldFilter(orFilter, entity));
    }

    // evaluate regular field filters
    return evaluateCrossFieldFilter(entityFilter, entity);
  };

  for (const id in entities) {
    const entity = entities[id];
    if (hasValidTypesProperty(entity) && entity['@@types@@'].includes(typeName)) {
      const relations = getEntityRelations(id, type, doc, include);
      try {
        const decoded = { ...decode({ ...entity, ...relations, id }), type: typeName };
        if (filter) {
          if (evaluateEntityFilter(filter, decoded)) {
            filtered.push(decoded);
          }
        } else {
          filtered.push(decoded);
        }
      } catch (error) {
        corruptEntityIds.push(id);
      }
    }
  }

  return { entities: filtered, corruptEntityIds: [] };
}

const stableEmptyArray: Array<unknown> = [];

export type FindManySubscription<S extends AnyNoContext> = {
  subscribe: (callback: () => void) => () => void;
  getEntities: () => Readonly<Array<Entity<S>>>;
};

export function subscribeToFindMany<const S extends AnyNoContext>(
  handle: DocHandle<DocumentContent>,
  type: S,
  filter: { [K in keyof Schema.Schema.Type<S>]?: EntityFieldFilter<Schema.Schema.Type<S>[K]> } | undefined,
  include: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined,
): FindManySubscription<S> {
  const queryKey = filter ? canonicalize(filter) : 'all';
  const decode = Schema.decodeUnknownSync(type);
  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;

  const getEntities = () => {
    const cacheEntry = decodedEntitiesCache.get(typeName);
    if (!cacheEntry) return stableEmptyArray;

    const query = cacheEntry.queries.get(queryKey);
    if (!query) return stableEmptyArray;

    if (!cacheEntry.isInvalidated && !query.isInvalidated) {
      return query.data;
    }

    const { entities } = findMany(handle, type, filter, include);

    for (const entity of entities) {
      cacheEntry?.entities.set(entity.id, entity);
    }

    // must be a new reference to ensure it can be used in React.useMemo
    query.data = [...entities];
    cacheEntry.isInvalidated = false;
    query.isInvalidated = false;

    return query.data;
  };

  const allTypes = new Set<S>();
  for (const [_key, field] of Object.entries(type.fields)) {
    if (isRelationField(field)) {
      allTypes.add(field as S);
    }
  }

  const subscribe = (callback: () => void) => {
    let cacheEntry = decodedEntitiesCache.get(typeName);

    if (!cacheEntry) {
      const entitiesMap = new Map();
      const queries = new Map<string, QueryEntry>();

      queries.set(queryKey, {
        data: [],
        listeners: [],
        isInvalidated: true,
        include: include ?? {},
      });

      cacheEntry = {
        decoder: decode,
        type,
        entities: entitiesMap,
        queries,
        isInvalidated: true,
      };

      decodedEntitiesCache.set(typeName, cacheEntry);
    }

    let query = cacheEntry.queries.get(queryKey);
    if (!query) {
      query = {
        data: [],
        listeners: [],
        isInvalidated: true,
        include: include ?? {},
      };
      // we just set up the query and expect it to correctly set itself up in findMany
      cacheEntry.queries.set(queryKey, query);
    }

    if (query?.listeners) {
      query.listeners.push(callback);
    }

    return () => {
      const cacheEntry = decodedEntitiesCache.get(typeName);
      if (cacheEntry) {
        // first cleanup the queries
        const query = cacheEntry.queries.get(queryKey);
        if (query) {
          query.listeners = query?.listeners?.filter((cachedListener) => cachedListener !== callback);
          if (query.listeners.length === 0) {
            cacheEntry.queries.delete(queryKey);
          }
        }
        // if the last query is removed, cleanup the entityRelationParentsMap and remove the decodedEntitiesCacheEntry
        if (cacheEntry.queries.size === 0) {
          entityRelationParentsMap.forEach((relationCacheEntries, key) => {
            for (const [relationCacheEntry, counter] of relationCacheEntries) {
              if (relationCacheEntry === cacheEntry && counter === 0) {
                relationCacheEntries.delete(cacheEntry);
              }
            }
            if (relationCacheEntries.size === 0) {
              entityRelationParentsMap.delete(key);
            }
          });
          decodedEntitiesCache.delete(typeName);
        }
      }

      documentChangeListener.subscribedQueriesCount--;
      if (documentChangeListener.subscribedQueriesCount === 0) {
        documentChangeListener.unsubscribe?.();
        documentChangeListener.unsubscribe = undefined;
      }
    };
  };

  if (documentChangeListener.subscribedQueriesCount === 0) {
    documentChangeListener.unsubscribe = subscribeToDocumentChanges(handle);
  }
  documentChangeListener.subscribedQueriesCount++;

  return { subscribe, getEntities };
}
