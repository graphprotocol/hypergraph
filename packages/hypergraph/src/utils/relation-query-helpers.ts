import type { RelationTypeIdInfo } from './get-relation-type-ids.js';

export const getRelationAlias = (typeId: string) => `relations_${typeId.replace(/-/g, '_')}`;

const buildRelationsListFragment = (info: RelationTypeIdInfo, level: 1 | 2) => {
  const alias = getRelationAlias(info.typeId);
  const nestedPlaceholder = info.includeNodes && level === 1 ? '__LEVEL2_RELATIONS__' : '';
  const listField = info.listField ?? 'relations';
  const connectionField = listField === 'backlinks' ? 'backlinks' : 'relations';
  const toEntityField = listField === 'backlinks' ? 'fromEntity' : 'toEntity';
  const toEntitySelectionHeader = toEntityField === 'toEntity' ? 'toEntity' : `toEntity: ${toEntityField}`;

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
          valuesList(filter: {spaceId: {is: $spaceId}}) {
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
          valuesList(filter: {spaceId: {is: $spaceId}}) {
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
      filter: {spaceId: {is: $spaceId}, typeId: {is: "${info.typeId}"}},
    ) {${totalCountSelection}${nodesSelection}
    }`;
};

const buildLevel2RelationsFragment = (relationInfoLevel2: RelationTypeIdInfo[]) => {
  if (relationInfoLevel2.length === 0) return '';

  return relationInfoLevel2.map((info) => buildRelationsListFragment(info, 2)).join('\n');
};

const buildLevel1RelationsFragment = (relationInfoLevel1: RelationTypeIdInfo[]) => {
  if (relationInfoLevel1.length === 0) return '';

  return relationInfoLevel1
    .map((info) => {
      const level2Fragment = buildLevel2RelationsFragment(info.children ?? []);
      const fragment = buildRelationsListFragment(info, 1);
      return fragment.replace('__LEVEL2_RELATIONS__', level2Fragment);
    })
    .join('\n');
};

export const buildRelationsSelection = (relationInfoLevel1: RelationTypeIdInfo[]) =>
  buildLevel1RelationsFragment(relationInfoLevel1);
