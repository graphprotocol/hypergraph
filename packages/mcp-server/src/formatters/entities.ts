import type { PrefetchedStore, StoredEntity } from '../store.js';

type StoredValue = StoredEntity['values'][number];

export const extractPropertyValue = (value: StoredValue): string | null => {
  if (value.text !== null && value.text !== undefined) return value.text;
  if (value.float !== null && value.float !== undefined) return String(value.float);
  if (value.boolean !== null && value.boolean !== undefined) return String(value.boolean);
  if (value.datetime !== null && value.datetime !== undefined) return value.datetime;
  if (value.point !== null && value.point !== undefined) return JSON.stringify(value.point);
  if (value.schedule !== null && value.schedule !== undefined) return JSON.stringify(value.schedule);
  return null;
};

const TRUNCATION_LIMIT = 500;

const truncateValue = (value: string): string => {
  if (value.length <= TRUNCATION_LIMIT) return value;
  const total = value.length;
  return `${value.slice(0, TRUNCATION_LIMIT)}... (truncated, ${total.toLocaleString()} chars total)`;
};

export const formatEntity = (
  entity: StoredEntity,
  store: PrefetchedStore,
  options?: { includeTimestamp?: boolean },
): string => {
  const lines: string[] = [];

  // Header
  lines.push(`### ${entity.name ?? '(unnamed)'}`);

  // Type resolution
  const typeNames = entity.typeIds.map((tid) => store.resolveTypeName(tid));
  lines.push(`**Type:** ${typeNames.length > 0 ? typeNames.join(', ') : '(untyped)'}`);
  lines.push(`**ID:** ${entity.id}`);
  lines.push('');

  // Properties section -- iterate over type schema to show all properties including empty
  lines.push('**Properties:**');

  const firstTypeId = entity.typeIds[0];
  const typeProperties = firstTypeId ? store.getTypeProperties(firstTypeId) : [];
  const valueMap = new Map(entity.values.map((v) => [v.propertyId, v]));
  const displayedPropertyIds = new Set<string>();

  for (const typeProp of typeProperties) {
    displayedPropertyIds.add(typeProp.id);
    const value = valueMap.get(typeProp.id);

    if (!value) {
      lines.push(`- ${typeProp.name}: (empty)`);
      continue;
    }

    const extracted = extractPropertyValue(value);
    if (extracted === null) {
      lines.push(`- ${typeProp.name}: (empty)`);
      continue;
    }

    lines.push(`- ${typeProp.name}: ${truncateValue(extracted)}`);
  }

  // Orphaned properties (in entity values but not in type schema)
  for (const value of entity.values) {
    if (displayedPropertyIds.has(value.propertyId)) continue;

    const propName = store.resolvePropertyName(value.propertyId);
    const extracted = extractPropertyValue(value);
    if (extracted === null) {
      lines.push(`- ${propName}: (empty)`);
    } else {
      lines.push(`- ${propName}: ${truncateValue(extracted)}`);
    }
  }

  // Relations section
  if (entity.relations.length > 0) {
    lines.push('');
    lines.push('**Relations:**');
    for (const relation of entity.relations) {
      const relName = store.resolvePropertyName(relation.typeId);
      const targetName = relation.toEntityName ?? store.resolveEntityName(relation.toEntityId);
      lines.push(`- ${relName}: ${targetName}`);
    }
  }

  // Timestamp footer (optional, for single-entity display)
  if (options?.includeTimestamp !== false) {
    lines.push('');
    lines.push(`*Data loaded at ${store.getPrefetchTimestamp()}*`);
  }

  return lines.join('\n');
};

export const formatEntityList = (
  entities: StoredEntity[],
  store: PrefetchedStore,
  options: {
    spaceName: string;
    typeName?: string;
    total: number;
    limit?: number;
    offset?: number;
  },
): string => {
  const lines: string[] = [];

  // Header
  if (options.typeName) {
    lines.push(`## ${options.typeName} entities in ${options.spaceName}`);
  } else {
    lines.push(`## Search results in ${options.spaceName}`);
  }

  // Count line
  if (options.limit !== undefined) {
    lines.push(`Showing ${entities.length} of ${options.total} entities`);
  } else {
    lines.push(`Found ${options.total} entities`);
  }

  lines.push('');

  // Each entity without individual timestamp
  for (const entity of entities) {
    lines.push(formatEntity(entity, store, { includeTimestamp: false }));
    lines.push('');
  }

  // Single footer timestamp
  lines.push(`*Data loaded at ${store.getPrefetchTimestamp()}*`);

  return lines.join('\n');
};
