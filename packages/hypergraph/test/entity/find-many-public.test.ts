import { Id } from '@graphprotocol/grc-20';
import { describe, expect, it } from 'vitest';
import { parseResult } from '../../src/entity/find-many-public.js';
import * as Entity from '../../src/entity/index.js';
import * as Type from '../../src/type/type.js';
import { getRelationTypeIds } from '../../src/utils/get-relation-type-ids.js';
import { getRelationAlias } from '../../src/utils/relation-query-helpers.js';

const TITLE_PROPERTY_ID = Id('79c1a951-0074-4010-87d0-7501ef9d7b3d');
const CHILDREN_RELATION_PROPERTY_ID = Id('ca7c7167-2502-49c4-90b0-84c147f9b12b');
const CHILD_NAME_PROPERTY_ID = Id('25584af0-3941-4ab9-86f7-a603305b19bb');

const Child = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('3c2ae3aa-4ec1-41e3-bc4c-1fe7a5e07bc1')],
    properties: {
      name: CHILD_NAME_PROPERTY_ID,
    },
  },
);

const Parent = Entity.Schema(
  {
    title: Type.String,
    children: Type.Relation(Child),
  },
  {
    types: [Id('af571d8c-06d4-4add-8cfa-4c6b50412254')],
    properties: {
      title: TITLE_PROPERTY_ID,
      children: CHILDREN_RELATION_PROPERTY_ID,
    },
  },
);

const buildValueEntry = (
  propertyId: string,
  value: Partial<{ string: string; boolean: boolean; number: number; time: string; point: string }> = {},
) => ({
  propertyId,
  string: value.string ?? '',
  boolean: value.boolean ?? false,
  number: value.number ?? 0,
  time: value.time ?? new Date(0).toISOString(),
  point: value.point ?? '0,0',
});

describe('findManyPublic parseResult', () => {
  it('collects invalidEntities when decoding fails', () => {
    const queryData = {
      entities: [
        {
          id: 'parent-valid',
          name: 'Parent valid',
          valuesList: [buildValueEntry(TITLE_PROPERTY_ID, { string: 'Parent valid' })],
          backlinksTotalCountsTypeId1: null,
        },
        {
          id: 'parent-invalid',
          name: 'Parent invalid',
          valuesList: [],
          backlinksTotalCountsTypeId1: null,
        },
      ],
    };

    const result = parseResult(queryData, Parent, []);

    expect(result.data).toHaveLength(1);
    expect(result.invalidEntities).toHaveLength(1);
    expect(result.invalidEntities[0].raw.id).toBe('parent-invalid');
    expect(result.invalidRelationEntities).toHaveLength(0);
  });

  it('collects invalidRelationEntities when nested relations fail to decode', () => {
    const relationAlias = getRelationAlias(CHILDREN_RELATION_PROPERTY_ID);
    const relationInfo = getRelationTypeIds(Parent, { children: {} });

    const queryData = {
      entities: [
        {
          id: 'parent-with-invalid-child',
          name: 'Parent with invalid child',
          valuesList: [buildValueEntry(TITLE_PROPERTY_ID, { string: 'Parent with invalid child' })],
          backlinksTotalCountsTypeId1: null,
          [relationAlias]: {
            nodes: [
              {
                id: 'relation-1',
                entity: { valuesList: [] },
                toEntity: {
                  id: 'child-bad',
                  name: 'Child bad',
                  valuesList: [],
                },
                typeId: CHILDREN_RELATION_PROPERTY_ID,
              },
            ],
          },
        },
      ],
    };

    // @ts-expect-error
    const result = parseResult(queryData, Parent, relationInfo);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].children).toEqual([]);
    expect(result.invalidEntities).toHaveLength(0);
    expect(result.invalidRelationEntities).toHaveLength(1);
    expect(result.invalidRelationEntities[0]).toMatchObject({
      parentEntityId: 'parent-with-invalid-child',
      propertyName: 'children',
    });
  });
});
