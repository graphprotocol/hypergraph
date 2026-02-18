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

export type PrefetchedStore = {
  // Phase 1 (unchanged signatures, widened return types)
  getSpaces: () => SpaceInfo[];
  getTypes: (spaceId: string) => TypeInfoWithProperties[];
  getSpaceNames: () => string[];

  // Phase 2 (new)
  getEntities: (spaceId: string) => StoredEntity[];
  getEntitiesByType: (spaceId: string, typeId: string) => StoredEntity[];
  getEntity: (entityId: string) => StoredEntity | undefined;
  searchEntities: (spaceId: string, query: string, typeId?: string) => StoredEntity[];
  resolvePropertyName: (propertyId: string) => string;
  resolveEntityName: (entityId: string) => string;
  resolveTypeName: (typeId: string) => string;
  getTypeProperties: (typeId: string) => Array<{ id: string; name: string; dataType: string }>;
  getPrefetchTimestamp: () => string;
};

export const buildStore = (prefetchedData: PrefetchedSpace[]): PrefetchedStore => {
  const prefetchTimestamp = new Date().toISOString();

  const spaces: SpaceInfo[] = prefetchedData.map((s) => ({ name: s.spaceName, id: s.spaceId }));

  // Property registry: propertyId -> PropertyInfo (from all type properties across all spaces)
  const propertyRegistry = new Map<string, PropertyInfo>();

  // Type name index: typeId -> typeName
  const typeNameIndex = new Map<string, string>();

  // Type properties index: typeId -> properties array
  const typePropertiesIndex = new Map<string, Array<{ id: string; name: string; dataType: string }>>();

  // Types by space (with properties)
  const typesBySpace = new Map<string, TypeInfoWithProperties[]>();

  for (const space of prefetchedData) {
    const types: TypeInfoWithProperties[] = [];

    for (const t of space.types) {
      if (t.name === null) continue;

      const properties: Array<{ id: string; name: string; dataType: string }> = [];
      for (const p of t.properties) {
        if (p.name !== null) {
          properties.push({ id: p.id, name: p.name, dataType: p.dataType });
          propertyRegistry.set(p.id, { name: p.name, dataType: p.dataType });
        }
      }

      types.push({ id: t.id, name: t.name, properties });
      typeNameIndex.set(t.id, t.name);
      typePropertiesIndex.set(t.id, properties);
    }

    typesBySpace.set(space.spaceId, types);
  }

  // Entity name index: entityId -> entityName
  const entityNameIndex = new Map<string, string>();

  // Entities by space
  const entitiesBySpace = new Map<string, StoredEntity[]>();

  // Entity by ID (for O(1) lookup)
  const entityById = new Map<string, StoredEntity>();

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
    }

    entitiesBySpace.set(space.spaceId, storedEntities);
  }

  return {
    getSpaces: () => spaces,
    getTypes: (spaceId: string) => typesBySpace.get(spaceId) ?? [],
    getSpaceNames: () => spaces.map((s) => s.name),

    getEntities: (spaceId: string) => entitiesBySpace.get(spaceId) ?? [],
    getEntitiesByType: (spaceId: string, typeId: string) => {
      const entities = entitiesBySpace.get(spaceId) ?? [];
      return entities.filter((e) => e.typeIds.includes(typeId));
    },
    getEntity: (entityId: string) => entityById.get(entityId),
    searchEntities: (spaceId: string, query: string, typeId?: string) => {
      const lower = query.toLowerCase();
      let entities = entitiesBySpace.get(spaceId) ?? [];

      if (typeId) {
        entities = entities.filter((e) => e.typeIds.includes(typeId));
      }

      return entities.filter((e) => e.name?.toLowerCase().includes(lower));
    },
    resolvePropertyName: (propertyId: string) => propertyRegistry.get(propertyId)?.name ?? propertyId,
    resolveEntityName: (entityId: string) => entityNameIndex.get(entityId) ?? entityId,
    resolveTypeName: (typeId: string) => typeNameIndex.get(typeId) ?? typeId,
    getTypeProperties: (typeId: string) => typePropertiesIndex.get(typeId) ?? [],
    getPrefetchTimestamp: () => prefetchTimestamp,
  };
};
