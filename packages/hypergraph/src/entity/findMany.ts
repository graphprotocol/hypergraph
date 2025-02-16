import type { DocHandle, Patch } from '@automerge/automerge-repo';
import * as Schema from 'effect/Schema';
import { type DecodedEntitiesCacheEntry, type QueryEntry, decodedEntitiesCache } from './decodedEntitiesCache.js';
import { entityRelationParentsMap } from './entityRelationParentsMap.js';
import { getEntityRelations } from './getEntityRelations.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import { isReferenceField } from './isReferenceField.js';
import type { AnyNoContext, DocumentContent, Entity } from './types.js';

const documentChangeListener: {
  subscribedQueriesCount: number;
  unsubscribe: undefined | (() => void);
} = {
  subscribedQueriesCount: 0,
  unsubscribe: undefined,
};

const subscribeToDocumentChanges = (handle: DocHandle<DocumentContent>) => {
  const onChange = ({ patches, doc }: { patches: Array<Patch>; doc: DocumentContent }) => {
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
          break;
        }
        case 'del': {
          if (patch.path.length === 2 && patch.path[0] === 'entities' && typeof patch.path[1] === 'string') {
            deletedEntities.add(patch.path[1]);
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

        const oldDecodedEntry = cacheEntry.entities.get(entityId);
        const relations = getEntityRelations(entity, cacheEntry.type, doc);
        const decoded = cacheEntry.decoder({
          ...entity,
          ...relations,
          id: entityId,
        });
        cacheEntry.entities.set(entityId, decoded);

        if (oldDecodedEntry) {
          // collect all the Ids for relation entries that don't exist in the `decoded` entry, but did in the `oldDecodedEntry`
          const deletedRelationIds = new Set<string>();
          for (const [fieldName, value] of Object.entries(oldDecodedEntry)) {
            if (Array.isArray(value)) {
              for (const relationEntity of value) {
                // @ts-expect-error decoded is a valid object
                if (!decoded[fieldName]?.includes(relationEntity.id)) {
                  deletedRelationIds.add(relationEntity.id);
                }
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

        // @ts-expect-error decoded is a valid object
        for (const [key, value] of Object.entries(decoded)) {
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

        const query = cacheEntry.queries.get('all');
        if (query) {
          const index = query.data.findIndex((entity) => entity.id === entityId);
          if (index !== -1) {
            query.data[index] = decoded;
          } else {
            query.data.push(decoded);
          }
          touchedQueries.add([typeName, 'all']);
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

          for (const [, query] of cacheEntry.queries) {
            // find the entity in the query and remove it using splice
            const index = query.data.findIndex((entity) => entity.id === entityId);
            if (index !== -1) {
              query.data.splice(index, 1);
              touchedQueries.add([affectedTypeName, 'all']);
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
): Readonly<Array<Entity<S>>> {
  const decode = Schema.decodeUnknownSync(type);
  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;

  const doc = handle.docSync();
  if (!doc) {
    return [];
  }
  const entities = doc.entities ?? {};
  const filtered: Array<Entity<S>> = [];
  for (const id in entities) {
    const entity = entities[id];
    if (hasValidTypesProperty(entity) && entity['@@types@@'].includes(typeName)) {
      const relations = getEntityRelations(entity, type, doc);
      filtered.push({ ...decode({ ...entity, ...relations, id }), type: typeName });
    }
  }

  return filtered;
}

const stableEmptyArray: Array<unknown> = [];

export function subscribeToFindMany<const S extends AnyNoContext>(
  handle: DocHandle<DocumentContent>,
  type: S,
): {
  subscribe: (callback: () => void) => () => void;
  getEntities: () => Readonly<Array<Entity<S>>>;
} {
  const queryKey = 'all';
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

    const entities = findMany(handle, type);
    for (const entity of entities) {
      cacheEntry?.entities.set(entity.id, entity);

      if (!query) continue;

      const index = query.data.findIndex((e) => e.id === entity.id);
      if (index !== -1) {
        query.data[index] = entity;
      } else {
        query.data.push(entity);
      }
    }

    cacheEntry.isInvalidated = false;
    query.isInvalidated = false;
    return query.data;
  };

  if (!decodedEntitiesCache.has(typeName)) {
    const entities = findMany(handle, type);
    const entitiesMap = new Map();
    for (const entity of entities) {
      entitiesMap.set(entity.id, entity);
    }

    const queries = new Map<string, QueryEntry>();

    queries.set(queryKey, {
      data: [...entities],
      listeners: [],
      isInvalidated: false,
    });

    const cacheEntry: DecodedEntitiesCacheEntry = {
      decoder: decode,
      type,
      entities: entitiesMap,
      queries,
      isInvalidated: false,
    };

    decodedEntitiesCache.set(typeName, cacheEntry);

    for (const entity of entities) {
      for (const [, value] of Object.entries(entity)) {
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
  }

  const allTypes = new Set<S>();
  for (const [_key, field] of Object.entries(type.fields)) {
    if (isReferenceField(field)) {
      allTypes.add(field as S);
    }
  }

  const subscribe = (callback: () => void) => {
    const query = decodedEntitiesCache.get(typeName)?.queries.get(queryKey);
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
