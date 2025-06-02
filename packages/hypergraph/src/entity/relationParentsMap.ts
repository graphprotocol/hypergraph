import type { DecodedEntitiesCacheEntry } from './decodedEntitiesCache.js';

export const relationParentsMap: Map<
  string, // relation Id
  Map<DecodedEntitiesCacheEntry, number>
> = new Map();
