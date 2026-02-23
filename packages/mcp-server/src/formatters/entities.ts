import type { PrefetchedStore, RelatedEntity, StoredEntity } from '../store.js';

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
  options?: { includeTimestamp?: boolean | undefined; showSpace?: boolean | undefined; skipEmpty?: boolean | undefined },
): string => {
  const lines: string[] = [];

  // Header
  lines.push(`### ${entity.name ?? '(unnamed)'}`);

  // Type resolution
  const typeNames = entity.typeIds.map((tid) => store.resolveTypeName(tid));
  lines.push(`**Type:** ${typeNames.length > 0 ? typeNames.join(', ') : '(untyped)'}`);
  lines.push(`**ID:** ${entity.id}`);
  if (options?.showSpace) {
    lines.push(`**Space:** ${store.resolveSpaceName(entity.spaceId)}`);
  }
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
      if (!options?.skipEmpty) lines.push(`- ${typeProp.name}: (empty)`);
      continue;
    }

    const extracted = extractPropertyValue(value);
    if (extracted === null) {
      if (!options?.skipEmpty) lines.push(`- ${typeProp.name}: (empty)`);
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
      if (!options?.skipEmpty) lines.push(`- ${propName}: (empty)`);
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
    filters?: Array<{ property: string; operator: string; value?: string | undefined }>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc' | undefined;
    crossSpace?: boolean;
    fallbackNote?: string;
  },
): string => {
  const lines: string[] = [];

  // Fallback note (rendered as blockquote above the header)
  if (options.fallbackNote) {
    lines.push(`> ${options.fallbackNote}`);
    lines.push('');
  }

  // Header
  if (options.typeName) {
    lines.push(
      options.crossSpace
        ? `## ${options.typeName} entities across all spaces`
        : `## ${options.typeName} entities in ${options.spaceName}`,
    );
  } else {
    lines.push(
      options.crossSpace ? '## Search results across all spaces' : `## Search results in ${options.spaceName}`,
    );
  }

  // Active filter/sort summary
  if (options.filters?.length) {
    const filterStr = options.filters
      .map((f) => (f.value !== undefined ? `${f.property} ${f.operator} ${f.value}` : `${f.property} ${f.operator}`))
      .join(' | ');
    lines.push(`**Filters:** ${filterStr}`);
  }
  if (options.sortBy) {
    lines.push(`**Sorted by:** ${options.sortBy} ${options.sortOrder ?? 'asc'}`);
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
    lines.push(formatEntity(entity, store, { includeTimestamp: false, showSpace: options.crossSpace, skipEmpty: true }));
    lines.push('');
  }

  // Single footer timestamp
  lines.push(`*Data loaded at ${store.getPrefetchTimestamp()}*`);

  return lines.join('\n');
};

// Compact table format for entity lists (token-efficient)
const formatEntityTableRows = (
  entities: StoredEntity[],
  store: PrefetchedStore,
  showSpace: boolean,
): string => {
  const rows = entities.map((e) => {
    const name = e.name ?? '(unnamed)';
    const type = e.typeIds.map((id) => store.resolveTypeName(id)).join(', ') || '(untyped)';
    const space = showSpace ? store.resolveSpaceName(e.spaceId) : null;
    return space
      ? `| ${name} | ${type} | ${space} | ${e.id} |`
      : `| ${name} | ${type} | ${e.id} |`;
  });
  const header = showSpace
    ? '| Name | Type | Space | ID |\n|------|------|-------|-----|'
    : '| Name | Type | ID |\n|------|------|-----|';
  return [header, ...rows].join('\n');
};

export const formatEntityListCompact = (
  entities: StoredEntity[],
  store: PrefetchedStore,
  options: {
    spaceName: string;
    typeName?: string;
    total: number;
    limit?: number;
    offset?: number;
    crossSpace?: boolean;
    fallbackNote?: string;
  },
): string => {
  const lines: string[] = [];

  if (options.fallbackNote) {
    lines.push(`> ${options.fallbackNote}`);
    lines.push('');
  }

  if (options.typeName) {
    lines.push(
      options.crossSpace
        ? `## ${options.typeName} entities across all spaces`
        : `## ${options.typeName} entities in ${options.spaceName}`,
    );
  } else {
    lines.push(options.crossSpace ? '## Search results across all spaces' : `## Search results in ${options.spaceName}`);
  }

  lines.push(
    options.limit !== undefined
      ? `Showing ${entities.length} of ${options.total} entities`
      : `Found ${options.total} entities`,
  );
  lines.push('');
  lines.push(formatEntityTableRows(entities, store, !!options.crossSpace));
  lines.push('');
  lines.push(`*Data loaded at ${store.getPrefetchTimestamp()}*`);
  return lines.join('\n');
};

export const formatRelatedEntityListCompact = (
  relatedEntities: RelatedEntity[],
  store: PrefetchedStore,
  options: {
    sourceEntityName: string;
    direction: 'outgoing' | 'incoming' | 'both';
    relationTypeName?: string;
    total: number;
    limit?: number;
    offset?: number;
  },
): string => {
  const lines: string[] = [];

  const dirLabel =
    options.direction === 'outgoing'
      ? 'outgoing from'
      : options.direction === 'incoming'
        ? 'incoming to'
        : 'related to';
  lines.push(`## Entities ${dirLabel} ${options.sourceEntityName}`);

  if (options.relationTypeName) {
    lines.push(`**Relation type filter:** ${options.relationTypeName}`);
  }

  lines.push(
    options.limit !== undefined
      ? `Showing ${relatedEntities.length} of ${options.total} related entities`
      : `Found ${options.total} related entities`,
  );
  lines.push('');

  lines.push('| Name | Type | Space | ID |');
  lines.push('|------|------|-------|-----|');
  for (const related of relatedEntities) {
    const e = related.entity;
    const name = e.name ?? '(unnamed)';
    const type = e.typeIds.map((id) => store.resolveTypeName(id)).join(', ') || '(untyped)';
    const space = store.resolveSpaceName(e.spaceId);
    lines.push(`| ${name} | ${type} | ${space} | ${e.id} |`);
  }

  lines.push('');
  lines.push(`*Data loaded at ${store.getPrefetchTimestamp()}*`);
  return lines.join('\n');
};

export const formatRelatedEntityList = (
  relatedEntities: RelatedEntity[],
  store: PrefetchedStore,
  options: {
    sourceEntityName: string;
    direction: 'outgoing' | 'incoming' | 'both';
    relationTypeName?: string;
    total: number;
    limit?: number;
    offset?: number;
  },
): string => {
  const lines: string[] = [];

  // Header
  const dirLabel =
    options.direction === 'outgoing'
      ? 'outgoing from'
      : options.direction === 'incoming'
        ? 'incoming to'
        : 'related to';
  lines.push(`## Entities ${dirLabel} ${options.sourceEntityName}`);

  if (options.relationTypeName) {
    lines.push(`**Relation type filter:** ${options.relationTypeName}`);
  }

  // Count line
  if (options.limit !== undefined) {
    lines.push(`Showing ${relatedEntities.length} of ${options.total} related entities`);
  } else {
    lines.push(`Found ${options.total} related entities`);
  }

  lines.push('');

  // Each entity with relation context
  for (const related of relatedEntities) {
    const relName = store.resolvePropertyName(related.relationTypeId);
    const arrow = related.direction === 'outgoing' ? '→' : '←';
    lines.push(`**${arrow} ${relName}**`);
    lines.push(formatEntity(related.entity, store, { includeTimestamp: false }));
    lines.push('');
  }

  // Single footer timestamp
  lines.push(`*Data loaded at ${store.getPrefetchTimestamp()}*`);

  return lines.join('\n');
};
