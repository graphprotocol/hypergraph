import type { PrefetchedSpace } from './prefetch.js';

export type SpaceInfo = { name: string; id: string };
export type TypeInfo = { id: string; name: string };

export type TypeInfoWithProperties = TypeInfo & {
  properties: Array<{ id: string; name: string; dataType: string }>;
};

export type PropertyInfo = { name: string; dataType: string };

export type StoredEntity = {
  id: string;
  name: string | null;
  typeIds: string[];
  values: Array<{
    propertyId: string;
    text: string | null;
    boolean: boolean | null;
    float: number | null;
    datetime: string | null;
    point: unknown | null;
    schedule: unknown | null;
  }>;
  relations: Array<{
    typeId: string;
    toEntityId: string;
    toEntityName: string | null;
  }>;
  spaceId: string;
};

export type RelatedEntity = {
  entity: StoredEntity;
  relationTypeId: string;
  direction: 'outgoing' | 'incoming';
};

export type PrefetchedStore = {
  // Phase 1 (unchanged signatures, widened return types)
  getSpaces: () => SpaceInfo[];
  getTypes: (spaceId: string) => TypeInfoWithProperties[];
  getSpaceNames: () => string[];

  // Phase 2 (new)
  getEntities: (spaceId: string) => StoredEntity[];
  getEntitiesByType: (spaceId: string, typeIds: string[]) => StoredEntity[];
  getEntity: (entityId: string) => StoredEntity | undefined;
  searchEntities: (spaceId: string, query: string, typeIds?: string[]) => StoredEntity[];
  resolvePropertyName: (propertyId: string) => string;
  resolveEntityName: (entityId: string) => string;
  resolveTypeName: (typeId: string) => string;
  getTypeProperties: (typeId: string) => Array<{ id: string; name: string; dataType: string }>;
  getPrefetchTimestamp: () => string;

  // Phase 3 (graph traversal)
  getRelatedEntities: (
    entityId: string,
    direction: 'outgoing' | 'incoming' | 'both',
    relationTypeIds?: string[],
  ) => RelatedEntity[];
  resolveRelationTypeIds: (name: string) => string[];
};

export const buildStore = (prefetchedData: PrefetchedSpace[]): PrefetchedStore => {
  const prefetchTimestamp = new Date().toISOString();

  const spaces: SpaceInfo[] = prefetchedData.map((s) => ({ name: s.spaceName, id: s.spaceId }));

  // Property registry: propertyId -> PropertyInfo (from root properties query)
  const propertyRegistry = new Map<string, PropertyInfo>();

  // Type name index: typeId -> typeName
  const typeNameIndex = new Map<string, string>();

  // Type properties index: typeId -> properties array (inferred from entity values)
  const typePropertiesIndex = new Map<string, Array<{ id: string; name: string; dataType: string }>>();

  // Track which property IDs belong to each type (used during inference)
  const typePropertyIds = new Map<string, Set<string>>();

  // Types by space (properties filled after entity scan)
  const typesBySpace = new Map<string, TypeInfoWithProperties[]>();

  // Build property registry from separate properties data
  for (const space of prefetchedData) {
    for (const p of space.properties) {
      if (p.name !== null) {
        propertyRegistry.set(p.id, { name: p.name, dataType: p.dataTypeName ?? 'unknown' });
      }
    }
  }

  // Index type names
  for (const space of prefetchedData) {
    for (const t of space.types) {
      if (t.name !== null) {
        typeNameIndex.set(t.id, t.name);
      }
    }
  }

  // Entity name index: entityId -> entityName
  const entityNameIndex = new Map<string, string>();

  // Entities by space
  const entitiesBySpace = new Map<string, StoredEntity[]>();

  // Entity by ID (for O(1) lookup)
  const entityById = new Map<string, StoredEntity>();

  // Reverse relations index: targetEntityId -> Array<{fromEntityId, typeId}>
  const reverseRelations = new Map<string, Array<{ fromEntityId: string; typeId: string }>>();

  for (const space of prefetchedData) {
    const storedEntities: StoredEntity[] = [];

    for (const e of space.entities) {
      const stored: StoredEntity = {
        id: e.id,
        name: e.name,
        typeIds: e.typeIds,
        values: e.valuesList,
        relations: e.relationsList.map((r) => ({
          typeId: r.typeId,
          toEntityId: r.toEntity.id,
          toEntityName: r.toEntity.name,
        })),
        spaceId: space.spaceId,
      };

      storedEntities.push(stored);
      entityById.set(e.id, stored);

      if (e.name) {
        entityNameIndex.set(e.id, e.name);
      }

      // Populate reverse relations index
      for (const rel of stored.relations) {
        let backlinks = reverseRelations.get(rel.toEntityId);
        if (!backlinks) {
          backlinks = [];
          reverseRelations.set(rel.toEntityId, backlinks);
        }
        backlinks.push({ fromEntityId: stored.id, typeId: rel.typeId });
      }

      // Infer type-to-property mapping from entity values
      for (const typeId of e.typeIds) {
        let propIds = typePropertyIds.get(typeId);
        if (!propIds) {
          propIds = new Set();
          typePropertyIds.set(typeId, propIds);
        }
        for (const v of e.valuesList) {
          propIds.add(v.propertyId);
        }
      }
    }

    entitiesBySpace.set(space.spaceId, storedEntities);
  }

  // Build type properties index from inferred mapping
  for (const [typeId, propIds] of typePropertyIds) {
    const properties: Array<{ id: string; name: string; dataType: string }> = [];
    for (const propId of propIds) {
      const info = propertyRegistry.get(propId);
      if (info) {
        properties.push({ id: propId, name: info.name, dataType: info.dataType });
      }
    }
    typePropertiesIndex.set(typeId, properties);
  }

  // Build typesBySpace — only include types that have entities in this space
  for (const space of prefetchedData) {
    const types: TypeInfoWithProperties[] = [];
    const spaceEntityTypeIds = new Set<string>();
    for (const e of space.entities) {
      for (const tid of e.typeIds) {
        spaceEntityTypeIds.add(tid);
      }
    }

    for (const t of space.types) {
      if (t.name === null) continue;
      if (!spaceEntityTypeIds.has(t.id)) continue;
      const properties = typePropertiesIndex.get(t.id) ?? [];
      types.push({ id: t.id, name: t.name, properties });
      typeNameIndex.set(t.id, t.name);
    }

    typesBySpace.set(space.spaceId, types);
  }

  return {
    getSpaces: () => spaces,
    getTypes: (spaceId: string) => typesBySpace.get(spaceId) ?? [],
    getSpaceNames: () => spaces.map((s) => s.name),

    getEntities: (spaceId: string) => entitiesBySpace.get(spaceId) ?? [],
    getEntitiesByType: (spaceId: string, typeIds: string[]) => {
      const idSet = new Set(typeIds);
      const entities = entitiesBySpace.get(spaceId) ?? [];
      return entities.filter((e) => e.typeIds.some((tid) => idSet.has(tid)));
    },
    getEntity: (entityId: string) => entityById.get(entityId),
    searchEntities: (spaceId: string, query: string, typeIds?: string[]) => {
      const lower = query.toLowerCase();
      let entities = entitiesBySpace.get(spaceId) ?? [];

      if (typeIds && typeIds.length > 0) {
        const idSet = new Set(typeIds);
        entities = entities.filter((e) => e.typeIds.some((tid) => idSet.has(tid)));
      }

      return entities.filter((e) => e.name?.toLowerCase().includes(lower));
    },
    resolvePropertyName: (propertyId: string) => propertyRegistry.get(propertyId)?.name ?? propertyId,
    resolveEntityName: (entityId: string) => entityNameIndex.get(entityId) ?? entityId,
    resolveTypeName: (typeId: string) => typeNameIndex.get(typeId) ?? typeId,
    getTypeProperties: (typeId: string) => typePropertiesIndex.get(typeId) ?? [],
    getPrefetchTimestamp: () => prefetchTimestamp,

    getRelatedEntities: (
      entityId: string,
      direction: 'outgoing' | 'incoming' | 'both',
      relationTypeIds?: string[],
    ): RelatedEntity[] => {
      const typeIdSet = relationTypeIds && relationTypeIds.length > 0 ? new Set(relationTypeIds) : null;
      const results: RelatedEntity[] = [];

      // Outgoing: entity -> targets
      if (direction === 'outgoing' || direction === 'both') {
        const entity = entityById.get(entityId);
        if (entity) {
          for (const rel of entity.relations) {
            if (typeIdSet && !typeIdSet.has(rel.typeId)) continue;
            const target = entityById.get(rel.toEntityId);
            if (target) {
              results.push({ entity: target, relationTypeId: rel.typeId, direction: 'outgoing' });
            }
          }
        }
      }

      // Incoming: sources -> entity
      if (direction === 'incoming' || direction === 'both') {
        const backlinks = reverseRelations.get(entityId) ?? [];
        for (const link of backlinks) {
          if (typeIdSet && !typeIdSet.has(link.typeId)) continue;
          const source = entityById.get(link.fromEntityId);
          if (source) {
            results.push({ entity: source, relationTypeId: link.typeId, direction: 'incoming' });
          }
        }
      }

      return results;
    },

    resolveRelationTypeIds: (name: string): string[] => {
      const lower = name.toLowerCase();
      const matches: string[] = [];

      for (const [id, info] of propertyRegistry) {
        const propLower = info.name.toLowerCase();
        if (propLower === lower) {
          matches.push(id);
        }
      }
      if (matches.length > 0) return matches;

      // Prefix match
      for (const [id, info] of propertyRegistry) {
        if (info.name.toLowerCase().startsWith(lower)) {
          matches.push(id);
        }
      }
      if (matches.length > 0) return matches;

      // Substring match
      for (const [id, info] of propertyRegistry) {
        if (info.name.toLowerCase().includes(lower)) {
          matches.push(id);
        }
      }
      return matches;
    },
  };
};
