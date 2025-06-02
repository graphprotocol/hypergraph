import type { DecodedEntitiesCacheEntry } from './decodedEntitiesCache.js';

export const entityRelationParentsMap: Map<
  string, // entity ID
  Map<DecodedEntitiesCacheEntry, number>
> = new Map();
