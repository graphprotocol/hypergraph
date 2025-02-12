import type { DocHandle, Patch } from '@automerge/automerge-repo';
import * as Schema from 'effect/Schema';
import { type QueryEntry, decodedEntitiesCache } from './decodedEntitiesCache.js';
import { getEntityRelations } from './getEntityRelations.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import { isReferenceField } from './isReferenceField.js';
import { relationParentQueries } from './relationParentQueries.js';
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

    const touchedRelationParentQueries = new Set<QueryEntry>();

    // loop over all changed entities and update the cache
    for (const entityId of changedEntities) {
      const entity = doc.entities?.[entityId];
      if (!hasValidTypesProperty(entity)) continue;
      for (const typeName of entity['@@types@@']) {
        if (typeof typeName !== 'string') continue;
        const cacheEntry = decodedEntitiesCache.get(typeName);
        if (!cacheEntry) continue;

        const relations = getEntityRelations(entity, cacheEntry.type, doc);
        const decoded = cacheEntry.decoder({
          ...entity,
          ...relations,
          id: entityId,
        });
        cacheEntry.entities.set(entityId, decoded);

        const query = cacheEntry.queries.get('all');
        if (query) {
          const index = query.data.findIndex((entity) => entity.id === entityId);
          if (index !== -1) {
            query.data[index] = decoded;
          } else {
            query.data.push(decoded);
          }
          touchedQueries.add([typeName, 'all']);

          // @ts-expect-error decoded is a valid object
          for (const [key, value] of Object.entries(decoded)) {
            if (Array.isArray(value)) {
              for (const relationEntity of value) {
                let relationParentQueriesEntry = relationParentQueries.get(relationEntity.id);
                if (!relationParentQueriesEntry) {
                  relationParentQueriesEntry = [];
                  relationParentQueries.set(relationEntity.id, relationParentQueriesEntry);
                }

                relationParentQueriesEntry.push(query);
              }
            }
          }
        }

        entityTypes.add(typeName);

        // gather all the queries of impacted parent relation queries
        if (relationParentQueries.has(entityId)) {
          const queries = relationParentQueries.get(entityId);
          if (!queries) return;

          for (const query of queries) {
            touchedRelationParentQueries.add(query);
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

      // gather all the queries of impacted parent relation queries
      if (relationParentQueries.has(entityId)) {
        const queries = relationParentQueries.get(entityId);
        if (!queries) return;

        for (const query of queries) {
          touchedRelationParentQueries.add(query);
        }
      }
    }

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
    // TODO: align with the touchedQueries to avoid unnecessary trigger calls
    for (const query of touchedRelationParentQueries) {
      query.isInvalidated = true;
      for (const listener of query.listeners) {
        listener();
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
    const query = cacheEntry?.queries.get(queryKey);
    if (!query) return stableEmptyArray;

    if (!query.isInvalidated) {
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

    query.isInvalidated = false;
    return query.data;
  };

  if (!decodedEntitiesCache.has(typeName)) {
    const entities = findMany(handle, type);
    const entitiesMap = new Map();
    const relationParentQueries = new Map();
    for (const entity of entities) {
      entitiesMap.set(entity.id, entity);
      relationParentQueries.set(entity.id, new Map());
    }

    const queries = new Map<string, QueryEntry>();

    queries.set(queryKey, {
      data: [...entities],
      listeners: [],
      isInvalidated: false,
    });

    decodedEntitiesCache.set(typeName, {
      decoder: decode,
      type,
      entities: entitiesMap,
      queries,
    });
  }

  const allTypes = new Set<S>();
  for (const [_key, field] of Object.entries(type.fields)) {
    if (isReferenceField(field)) {
      allTypes.add(field as S);
    }
  }

  for (const type of allTypes) {
    // TODO: what's the right way to get the name of the type?
    // @ts-expect-error name is defined
    const typeName = type.name;
    const entities = findMany(handle, type);

    if (decodedEntitiesCache.has(typeName)) {
      // add a listener to the existing query
      const cacheEntry = decodedEntitiesCache.get(typeName);

      for (const entity of entities) {
        cacheEntry?.entities.set(entity.id, entity);
      }
    } else {
      const entitiesMap = new Map();
      const relationParentQueries = new Map();
      for (const entity of entities) {
        entitiesMap.set(entity.id, entity);
        relationParentQueries.set(entity.id, new Map());
      }

      decodedEntitiesCache.set(typeName, {
        decoder: decode,
        type,
        entities: entitiesMap,
        queries: new Map(),
      });
    }
  }

  const subscribe = (callback: () => void) => {
    const query = decodedEntitiesCache.get(typeName)?.queries.get(queryKey);
    if (query?.listeners) {
      query.listeners.push(callback);
    }
    return () => {
      const query = decodedEntitiesCache.get(typeName)?.queries.get(queryKey);
      if (query?.listeners) {
        query.listeners = query?.listeners?.filter((cachedListener) => cachedListener !== callback);
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
