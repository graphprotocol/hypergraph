import type { RelationTypeIdInfo } from './get-relation-type-ids.js';

type SpaceSelectionMode = 'single' | 'many' | 'all';

const formatGraphQLStringArray = (values: readonly string[]) =>
  `[${values.map((value) => JSON.stringify(value)).join(', ')}]`;

const buildValuesListFilter = (
  spaceSelectionMode: SpaceSelectionMode,
  override?: RelationTypeIdInfo['valueSpaces'],
) => {
  if (!override) {
    if (spaceSelectionMode === 'single') {
      return '(filter: {spaceId: {is: $spaceId}})';
    }
    if (spaceSelectionMode === 'many') {
      return '(filter: {spaceId: {in: $spaceIds}})';
    }
    return '';
  }

  if (override === 'all') {
    return '';
  }

  if (override.length === 0) {
    // Explicit empty overrides should produce a match-nothing filter.
    return '(filter: {spaceId: {in: []}})';
  }

  return `(filter: {spaceId: {in: ${formatGraphQLStringArray(override)}}})`;
};

const buildRelationSpaceFilter = (
  spaceSelectionMode: SpaceSelectionMode,
  override?: RelationTypeIdInfo['relationSpaces'],
) => {
  if (!override) {
    if (spaceSelectionMode === 'single') {
      return 'spaceId: {is: $spaceId}, ';
    }
    if (spaceSelectionMode === 'many') {
      return 'spaceId: {in: $spaceIds}, ';
    }
    return '';
  }

  if (override === 'all') {
    return '';
  }

  if (override.length === 0) {
    return 'spaceId: {in: []}, ';
  }

  return `spaceId: {in: ${formatGraphQLStringArray(override)}}, `;
};

export const getRelationAlias = (typeId: string) => `relations_${typeId.replace(/-/g, '_')}`;

const buildRelationsListFragment = (info: RelationTypeIdInfo, level: 1 | 2, spaceSelectionMode: SpaceSelectionMode) => {
  const alias = getRelationAlias(info.typeId);
  const nestedPlaceholder = info.includeNodes && level === 1 ? '__LEVEL2_RELATIONS__' : '';
  const listField = info.listField ?? 'relations';
  const connectionField = listField === 'backlinks' ? 'backlinks' : 'relations';
  const toEntityField = listField === 'backlinks' ? 'fromEntity' : 'toEntity';
  const toEntitySelectionHeader = toEntityField === 'toEntity' ? 'toEntity' : `toEntity: ${toEntityField}`;
  const valuesListFilter = buildValuesListFilter(spaceSelectionMode, info.valueSpaces);
  const relationSpaceFilter = buildRelationSpaceFilter(spaceSelectionMode, info.relationSpaces);

  if (!info.includeNodes && !info.includeTotalCount) {
    return '';
  }

  const totalCountSelection = info.includeTotalCount
    ? `
      totalCount`
    : '';

  const nodesSelection = info.includeNodes
    ? `
      nodes {
        id
        entity {
          valuesList${valuesListFilter} {
            propertyId
            string
            boolean
            number
            time
            point
          }
        }
        ${toEntitySelectionHeader} {
          id
          name
          valuesList${valuesListFilter} {
            propertyId
            string
            boolean
            number
            time
            point
          }
          ${nestedPlaceholder}
        }
        typeId
      }`
    : '';

  return `
    ${alias}: ${connectionField}(
      filter: {${relationSpaceFilter}typeId: {is: "${info.typeId}"}},
    ) {${totalCountSelection}${nodesSelection}
    }`;
};

const buildLevel2RelationsFragment = (
  relationInfoLevel2: RelationTypeIdInfo[],
  spaceSelectionMode: SpaceSelectionMode,
) => {
  if (relationInfoLevel2.length === 0) return '';

  return relationInfoLevel2.map((info) => buildRelationsListFragment(info, 2, spaceSelectionMode)).join('\n');
};

const buildLevel1RelationsFragment = (
  relationInfoLevel1: RelationTypeIdInfo[],
  spaceSelectionMode: SpaceSelectionMode,
) => {
  if (relationInfoLevel1.length === 0) return '';

  return relationInfoLevel1
    .map((info) => {
      const level2Fragment = buildLevel2RelationsFragment(info.children ?? [], spaceSelectionMode);
      const fragment = buildRelationsListFragment(info, 1, spaceSelectionMode);
      return fragment.replace('__LEVEL2_RELATIONS__', level2Fragment);
    })
    .join('\n');
};

export const buildRelationsSelection = (
  relationInfoLevel1: RelationTypeIdInfo[],
  spaceSelectionMode: SpaceSelectionMode,
) => buildLevel1RelationsFragment(relationInfoLevel1, spaceSelectionMode);
