import type * as Schema from 'effect/Schema';
import type { AnyNoContext, Entity } from './types.js';

export type QueryEntry = {
  data: Array<Entity<AnyNoContext>>; // holds the decoded entities of this query and must be a stable reference and use the same reference for the `entities` array
  listeners: Array<() => void>; // listeners to this query
  isInvalidated: boolean;
  include: { [K in keyof Schema.Schema.Type<AnyNoContext>]?: Record<string, Record<string, never>> };
};

export type DecodedEntitiesCacheEntry = {
  decoder: (data: unknown) => unknown;
  type: AnyNoContext; // TODO should be the type of the entity
  entities: Map<string, Entity<AnyNoContext>>; // holds all entities of this type
  queries: Map<
    string, // instead of serializedQueryKey as string we could also have the actual params
    QueryEntry
  >;
  isInvalidated: boolean;
};

/*
/*
 * Note: Currently we only use one global cache for all entities.
 * In the future we probably want a build function that creates a cache and returns the
 * functions (create, update, findMany, …) that use this specific cache.
 *
 * How does it work?
 *
 * We store all decoded entities in a cache and for each query we reference the entities relevant to this query.
 * Whenever a query is registered we add it to the cache and add a listener to the query. Whenever a query is unregistered we remove the listener from the query.
 */
type DecodedEntitiesCache = Map<
  string, // type name
  DecodedEntitiesCacheEntry
>;

export const decodedEntitiesCache: DecodedEntitiesCache = new Map();
