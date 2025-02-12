import type { QueryEntry } from './decodedEntitiesCache.js';

export const relationParentQueries: Map<
  string, // entity ID
  Array<QueryEntry>
> = new Map();
