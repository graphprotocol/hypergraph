import { Id } from '@geoprotocol/geo-sdk';
import { describe, expect, it } from 'vitest';
import { parseResult } from '../../src/entity/find-many-public.js';
import * as Entity from '../../src/entity/index.js';
import * as Type from '../../src/type/type.js';
import { getOrderByDataType } from '../../src/utils/convert-property-value.js';
import { getRelationTypeIds } from '../../src/utils/get-relation-type-ids.js';
import { getRelationAlias } from '../../src/utils/relation-query-helpers.js';

const TITLE_PROPERTY_ID = Id('79c1a9510074401087d07501ef9d7b3d');
const CHILDREN_RELATION_PROPERTY_ID = Id('ca7c7167250249c490b084c147f9b12b');
const CHILD_NAME_PROPERTY_ID = Id('25584af039414ab986f7a603305b19bb');
const SCORE_PROPERTY_ID = Id('0f0f62df02194f16983ad2ae5fc43ee5');
const IS_ACTIVE_PROPERTY_ID = Id('774f4b5dbfaf4af5925ef4c7ef2ebd76');
const PUBLISHED_AT_PROPERTY_ID = Id('2ece4d97ea964a269f3fee0d0f00de53');
const LOCATION_PROPERTY_ID = Id('2df8bd4f7bc34aafaa8db20e3ad41657');
const CADENCE_PROPERTY_ID = Id('0f7952a1f8474b4286d0ef7e6ef8dbb2');

const Child = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('3c2ae3aa4ec141e3bc4c1fe7a5e07bc1')],
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
    types: [Id('af571d8c06d44add8cfa4c6b50412254')],
    properties: {
      title: TITLE_PROPERTY_ID,
      children: CHILDREN_RELATION_PROPERTY_ID,
    },
  },
);

const OrderableParent = Entity.Schema(
  {
    title: Type.String,
    score: Type.Number,
    isActive: Type.Boolean,
    publishedAt: Type.Date,
    location: Type.Point,
    cadence: Type.ScheduleString,
    children: Type.Relation(Child),
  },
  {
    types: [Id('af571d8c06d44add8cfa4c6b50412254')],
    properties: {
      title: TITLE_PROPERTY_ID,
      score: SCORE_PROPERTY_ID,
      isActive: IS_ACTIVE_PROPERTY_ID,
      publishedAt: PUBLISHED_AT_PROPERTY_ID,
      location: LOCATION_PROPERTY_ID,
      cadence: CADENCE_PROPERTY_ID,
      children: CHILDREN_RELATION_PROPERTY_ID,
    },
  },
);

const getPropertyTypeAst = (property: string) => {
  const ast = OrderableParent.ast;
  if (!('propertySignatures' in ast)) {
    throw new Error('Expected schema AST to be a TypeLiteral');
  }

  const signature = ast.propertySignatures.find((prop) => String(prop.name) === property);
  if (!signature) {
    throw new Error(`Property ${property} not found in schema`);
  }

  return signature.type;
};

const buildValueEntry = (
  propertyId: string,
  value: Partial<{
    text: string;
    boolean: boolean;
    float: number;
    datetime: string;
    point: string;
    schedule: string;
  }> = {},
) => ({
  propertyId,
  text: value.text ?? '',
  boolean: value.boolean ?? false,
  float: value.float ?? 0,
  datetime: value.datetime ?? new Date(0).toISOString(),
  point: value.point ?? '0,0',
  schedule: value.schedule ?? '',
});

describe('findManyPublic parseResult', () => {
  it('maps schema property types to orderBy data types', () => {
    expect(getOrderByDataType(getPropertyTypeAst('title'))).toBe('text');
    expect(getOrderByDataType(getPropertyTypeAst('score'))).toBe('float');
    expect(getOrderByDataType(getPropertyTypeAst('isActive'))).toBe('boolean');
    expect(getOrderByDataType(getPropertyTypeAst('publishedAt'))).toBe('datetime');
    expect(getOrderByDataType(getPropertyTypeAst('location'))).toBe('point');
    expect(getOrderByDataType(getPropertyTypeAst('cadence'))).toBe('schedule');
    expect(getOrderByDataType(getPropertyTypeAst('children'))).toBeUndefined();
  });

  it('collects invalidEntities when decoding fails', () => {
    const queryData = {
      entities: [
        {
          id: 'parent-valid',
          name: 'Parent valid',
          valuesList: [buildValueEntry(TITLE_PROPERTY_ID, { text: 'Parent valid' })],
          spaceIds: [],
        },
        {
          id: 'parent-invalid',
          name: 'Parent invalid',
          valuesList: [],
          spaceIds: [],
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
    const relationInfo = getRelationTypeIds(Parent, { children: {} });
    const childrenRelationInfo = relationInfo.find((info) => info.propertyName === 'children');
    const relationAlias = getRelationAlias(CHILDREN_RELATION_PROPERTY_ID, childrenRelationInfo?.targetTypeIds);

    const queryData = {
      entities: [
        {
          id: 'parent-with-invalid-child',
          name: 'Parent with invalid child',
          valuesList: [buildValueEntry(TITLE_PROPERTY_ID, { text: 'Parent with invalid child' })],
          spaceIds: [],
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

  it('exposes normalized spaceIds when requested', () => {
    const queryData = {
      entities: [
        {
          id: 'parent-with-spaces',
          name: 'Parent with spaces',
          valuesList: [buildValueEntry(TITLE_PROPERTY_ID, { text: 'Parent with spaces' })],
          spaceIds: ['space-1', null, 'space-2'],
        },
      ],
    };

    const result = parseResult(queryData, Parent, [], { includeSpaceIds: true });

    expect(result.data).toHaveLength(1);
    const entityWithSpaceIds = result.data[0] as { spaceIds?: string[] };
    expect(entityWithSpaceIds.spaceIds).toEqual(['space-1', 'space-2']);
  });
});
