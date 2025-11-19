import type { RelationTypeIdInfo } from './get-relation-type-ids.js';

export const getRelationAlias = (typeId: string) => `relationsList_${typeId.replace(/-/g, '_')}`;

const buildRelationsListFragment = (typeId: string, level: 1 | 2) => {
  const alias = getRelationAlias(typeId);
  const nestedPlaceholder = level === 1 ? '__LEVEL2_RELATIONS__' : '';

  return `
    ${alias}: relationsList(
      filter: {spaceId: {is: $spaceId}, typeId: {is: "${typeId}"}},
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
      toEntity {
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

  return relationInfoLevel2.map((info) => buildRelationsListFragment(info.typeId, 2)).join('\n');
};

const buildLevel1RelationsFragment = (relationInfoLevel1: RelationTypeIdInfo[]) => {
  if (relationInfoLevel1.length === 0) return '';

  return relationInfoLevel1
    .map((info) => {
      const level2Fragment = buildLevel2RelationsFragment(info.children ?? []);
      const fragment = buildRelationsListFragment(info.typeId, 1);
      return fragment.replace('__LEVEL2_RELATIONS__', level2Fragment);
    })
    .join('\n');
};

export const buildRelationsSelection = (relationInfoLevel1: RelationTypeIdInfo[]) =>
  buildLevel1RelationsFragment(relationInfoLevel1);
