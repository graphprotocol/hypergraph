import type { DecodedEntitiesCacheEntry } from './decodedEntitiesCache.js';

export const entityRelationParentsMap: Map<
  string, // entity ID
  Array<DecodedEntitiesCacheEntry>
> = new Map();
