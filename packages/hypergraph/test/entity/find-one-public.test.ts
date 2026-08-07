import { Id } from '@geoprotocol/geo-sdk';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findOnePublic } from '../../src/entity/find-one-public.js';
import * as Entity from '../../src/entity/index.js';
import * as Type from '../../src/type/type.js';
import { getRelationTypeIds } from '../../src/utils/get-relation-type-ids.js';
import { getRelationAlias } from '../../src/utils/relation-query-helpers.js';

const mockRequest = vi.hoisted(() => vi.fn());

vi.mock('graphql-request', () => ({
  request: mockRequest,
}));

const TITLE_PROPERTY_ID = Id('c6c9ad0ff3334f508e928d93bc38b63c');
const CHILDREN_RELATION_PROPERTY_ID = Id('1e8caeb93e644dd3b7a43d9cc714d4f2');
const CHILD_NAME_PROPERTY_ID = Id('7a9e63df80e34c44baf4844a6b9511cd');
const BOUNTY_NAME_PROPERTY_ID = Id('5d07de37f0a349c98bcb664fba357f7e');
const SUBMISSION_RELATION_PROPERTY_ID = Id('3b4c516ff3ac41e0a939374119a27d6e');

const Child = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('1a6d868acb0c4b2daef88e4e8a9a6a55')],
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
    types: [Id('6a9fee9c0a624272b64d99c83f3f970b')],
    properties: {
      title: TITLE_PROPERTY_ID,
      children: CHILDREN_RELATION_PROPERTY_ID,
    },
  },
);

const Bounty = Entity.Schema(
  {
    name: Type.String,
    proposals: Type.ProposalBacklink(),
  },
  {
    types: [Id('4f08bcb188d04db0a455fa623bfc19aa')],
    properties: {
      name: BOUNTY_NAME_PROPERTY_ID,
      proposals: SUBMISSION_RELATION_PROPERTY_ID,
    },
  },
);

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
    const relationInfo = getRelationTypeIds(Parent, { children: {} });
    const childrenRelationInfo = relationInfo.find((info) => info.propertyName === 'children');
    const relationAlias = getRelationAlias(CHILDREN_RELATION_PROPERTY_ID, childrenRelationInfo?.targetTypeIds);

    const entity = {
      id: 'parent-2',
      name: 'Parent 2',
      valuesList: [buildValueEntry(TITLE_PROPERTY_ID, { text: 'Parent 2' })],
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

  it('hydrates proposal backlinks by querying proposals with collected ids', async () => {
    const relationInfo = getRelationTypeIds(Bounty, { proposals: {} });
    const proposalsRelationInfo = relationInfo.find((info) => info.propertyName === 'proposals');
    const relationAlias = getRelationAlias(SUBMISSION_RELATION_PROPERTY_ID, proposalsRelationInfo?.targetTypeIds);

    const proposalId = '000afabf90cf42bbb1bb0fe77af20e56';
    const proposalPayload = {
      id: proposalId,
      proposedBy: '52c7ae149838b6d47ce0f3b2a5974546',
      executedAt: '1771111365',
      spaceId: '52c7ae149838b6d47ce0f3b2a5974546',
      votingMode: 'FAST',
      startTime: '1771082486',
      endTime: '1771168886',
      quorum: '1',
      threshold: '0',
      name: 'Add Member',
      createdAt: '1771082486',
      noCount: '0',
      yesCount: '1',
      createdAtBlock: '92716',
    };

    mockRequest.mockResolvedValueOnce({
      entity: {
        id: 'bounty-1',
        name: 'Bounty 1',
        valuesList: [buildValueEntry(BOUNTY_NAME_PROPERTY_ID, { text: 'Bounty 1' })],
        [relationAlias]: {
          nodes: [
            {
              id: 'submission-1',
              entity: { valuesList: [] },
              toEntity: {
                id: proposalId,
                name: 'proposal',
                valuesList: [],
              },
              typeId: SUBMISSION_RELATION_PROPERTY_ID,
            },
          ],
        },
      },
    });
    mockRequest.mockResolvedValueOnce({
      proposals: [proposalPayload],
    });

    const result = await findOnePublic(Bounty, {
      id: 'bounty-1',
      space: 'space-1',
      include: {
        proposals: {},
      },
    });

    expect(mockRequest).toHaveBeenCalledTimes(2);
    expect(mockRequest.mock.calls[1]?.[2]).toEqual({
      ids: [proposalId],
    });
    expect(result.invalidEntity).toBeNull();
    expect(result.invalidRelationEntities).toEqual([]);
    expect(result.entity?.proposals).toEqual([
      {
        ...proposalPayload,
        _relation: {
          id: 'submission-1',
        },
      },
    ]);
  });
});
