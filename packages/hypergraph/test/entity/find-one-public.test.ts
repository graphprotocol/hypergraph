import { Id } from '@graphprotocol/grc-20';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Entity from '../../src/entity/index.js';
import { findOnePublic } from '../../src/entity/find-one-public.js';
import * as Type from '../../src/type/type.js';
import { getRelationAlias } from '../../src/utils/relation-query-helpers.js';

const mockRequest = vi.hoisted(() => vi.fn());

vi.mock('graphql-request', () => ({
  request: mockRequest,
}));

const TITLE_PROPERTY_ID = Id('c6c9ad0f-f333-4f50-8e92-8d93bc38b63c');
const CHILDREN_RELATION_PROPERTY_ID = Id('1e8caeb9-3e64-4dd3-b7a4-3d9cc714d4f2');
const CHILD_NAME_PROPERTY_ID = Id('7a9e63df-80e3-4c44-baf4-844a6b9511cd');

const Child = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('1a6d868a-cb0c-4b2d-aef8-8e4e8a9a6a55')],
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
    types: [Id('6a9fee9c-0a62-4272-b64d-99c83f3f970b')],
    properties: {
      title: TITLE_PROPERTY_ID,
      children: CHILDREN_RELATION_PROPERTY_ID,
    },
  },
);

const buildValueEntry = (propertyId: string, value: Partial<{ string: string; boolean: boolean; number: number; time: string; point: string }> = {}) => ({
  propertyId,
  string: value.string ?? '',
  boolean: value.boolean ?? false,
  number: value.number ?? 0,
  time: value.time ?? new Date(0).toISOString(),
  point: value.point ?? '0,0',
});

describe('findOnePublic', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('surfaces invalidEntity data when decoding fails', async () => {
    mockRequest.mockResolvedValueOnce({
      entity: {
        id: 'parent-1',
        name: 'Parent 1',
        valuesList: [],
      },
    });

    const result = await findOnePublic(Parent, { id: 'parent-1', space: 'space-1' });

    expect(result.entity).toBeNull();
    expect(result.invalidEntity).not.toBeNull();
    expect(result.invalidEntity?.raw.id).toBe('parent-1');
    expect(result.invalidRelationEntities).toHaveLength(0);
  });

  it('collects invalidRelationEntities when nested relations fail to decode', async () => {
    const relationAlias = getRelationAlias(CHILDREN_RELATION_PROPERTY_ID);

    const entity = {
      id: 'parent-2',
      name: 'Parent 2',
      valuesList: [buildValueEntry(TITLE_PROPERTY_ID, { string: 'Parent 2' })],
      [relationAlias]: {
        nodes: [
          {
            id: 'relation-1',
            entity: { valuesList: [] },
            toEntity: {
              id: 'child-1',
              name: 'Child 1',
              valuesList: [],
            },
            typeId: CHILDREN_RELATION_PROPERTY_ID,
          },
        ],
      },
    };

    mockRequest.mockResolvedValueOnce({
      entity,
    });

    const result = await findOnePublic(Parent, {
      id: 'parent-2',
      space: 'space-1',
      include: {
        children: {},
      },
    });

    expect(result.entity).not.toBeNull();
    expect(result.entity?.title).toBe('Parent 2');
    expect(result.entity?.children).toEqual([]);
    expect(result.invalidEntity).toBeNull();
    expect(result.invalidRelationEntities).toHaveLength(1);
    expect(result.invalidRelationEntities[0]).toMatchObject({
      parentEntityId: 'parent-2',
      propertyName: 'children',
    });
  });
});


