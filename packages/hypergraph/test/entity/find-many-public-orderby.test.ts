import { Id } from '@geoprotocol/geo-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findManyPublic } from '../../src/entity/find-many-public.js';
import * as Entity from '../../src/entity/index.js';
import * as Type from '../../src/type/type.js';
import { getOrderByDataType } from '../../src/utils/convert-property-value.js';

const mockRequest = vi.hoisted(() => vi.fn());

vi.mock('graphql-request', () => ({
  request: mockRequest,
}));

const TITLE_PROPERTY_ID = Id('79c1a9510074401087d07501ef9d7b3d');
const SCORE_PROPERTY_ID = Id('0f0f62df02194f16983ad2ae5fc43ee5');
const CHILDREN_RELATION_PROPERTY_ID = Id('ca7c7167250249c490b084c147f9b12b');
const CHILD_NAME_PROPERTY_ID = Id('25584af039414ab986f7a603305b19bb');

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
    score: Type.Number,
    children: Type.Relation(Child),
  },
  {
    types: [Id('af571d8c06d44add8cfa4c6b50412254')],
    properties: {
      title: TITLE_PROPERTY_ID,
      score: SCORE_PROPERTY_ID,
      children: CHILDREN_RELATION_PROPERTY_ID,
    },
  },
);

describe('findManyPublic orderBy', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue({ entities: [] });
  });

  it('passes inferred dataType for sortable fields', async () => {
    await findManyPublic(Parent, {
      space: 'space-1',
      orderBy: {
        property: 'score',
        direction: 'desc',
      },
      logInvalidResults: false,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
    const [, queryDocument, queryVariables] = mockRequest.mock.calls[0];

    expect(queryDocument as string).toContain('$dataType: String');
    expect(queryDocument as string).toContain('dataType: $dataType');
    expect(queryVariables).toMatchObject({
      propertyId: SCORE_PROPERTY_ID,
      dataType: 'float',
      sortDirection: 'DESC',
    });
  });

  it('omits dataType for unresolved orderBy field types', async () => {
    await findManyPublic(Parent, {
      space: 'space-1',
      orderBy: {
        property: 'children',
        direction: 'asc',
      },
      logInvalidResults: false,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
    const [, queryDocument, queryVariables] = mockRequest.mock.calls[0];

    expect(queryDocument as string).not.toContain('$dataType: String');
    expect(queryDocument as string).not.toContain('dataType: $dataType');
    expect(queryVariables).toMatchObject({
      propertyId: CHILDREN_RELATION_PROPERTY_ID,
      sortDirection: 'ASC',
    });
    expect((queryVariables as Record<string, unknown>).dataType).toBeUndefined();
  });
});

describe('getOrderByDataType', () => {
  it('maps schema builder outputs to GraphQL order dataType values', () => {
    expect(getOrderByDataType(Type.String('prop').ast)).toBe('text');
    expect(getOrderByDataType(Type.Number('prop').ast)).toBe('float');
    expect(getOrderByDataType(Type.Boolean('prop').ast)).toBe('boolean');
    expect(getOrderByDataType(Type.Date('prop').ast)).toBe('datetime');
    expect(getOrderByDataType(Type.Point('prop').ast)).toBe('point');
    expect(getOrderByDataType(Type.ScheduleString('prop').ast)).toBe('schedule');
    expect(getOrderByDataType(Type.Relation(Child)('prop').ast)).toBeUndefined();
  });
});
