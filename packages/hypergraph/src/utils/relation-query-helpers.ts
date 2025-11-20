import type { RelationTypeIdInfo } from './get-relation-type-ids.js';

export const getRelationAlias = (typeId: string) => `relationsList_${typeId.replace(/-/g, '_')}`;

const buildRelationsListFragment = (info: RelationTypeIdInfo, level: 1 | 2) => {
  const alias = getRelationAlias(info.typeId);
  const nestedPlaceholder = level === 1 ? '__LEVEL2_RELATIONS__' : '';
  const listField = info.listField ?? 'relationsList';
  const toEntityField = listField === 'backlinksList' ? 'fromEntity' : 'toEntity';
  const toEntitySelectionHeader = toEntityField === 'toEntity' ? 'toEntity' : `toEntity: ${toEntityField}`;

  return `
    ${alias}: ${listField}(
      filter: {spaceId: {is: $spaceId}, typeId: {is: "${info.typeId}"}},
    ) {
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
