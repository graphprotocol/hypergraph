import { Id } from '@graphprotocol/grc-20';
import { describe, expect, it } from 'vitest';
import * as Entity from '../../src/entity/index.js';
import * as Type from '../../src/type/type.js';
import { getRelationTypeIds } from '../../src/utils/get-relation-type-ids.js';
import { buildRelationsSelection, getRelationAlias } from '../../src/utils/relation-query-helpers.js';

const FRIENDS_RELATION_PROPERTY_ID = Id('f44ae32a-2f13-4d3f-875f-19d2338a32b8');
const CHILDREN_RELATION_PROPERTY_ID = Id('8a6dcb99-9c7b-4ca9-9f7b-98f2f404b405');
const PARENT_TYPES = [Id('842e8ae0-9904-40a8-9bfe-19e1f4400c5e')];
const CHILD_TYPES = [Id('cd9a2ae2-831c-4fa2-b714-ad3aa254db7d')];
const FRIEND_TYPES = [Id('35ac5c3e-4f31-466e-b3da-51fdfbb4b38e')];
const PODCAST_TYPES = [Id('f347d2a2-cc18-4d45-aa9a-0df3ba40f4ad')];
const EPISODE_TYPES = [Id('b1fe2f9e-1f6a-4f07-a0fb-3f5d463f98f1')];
const NAME_PROPERTY_ID = Id('9f5e7ea4-51bb-4c9f-8739-7fa0aa695d02');
const PODCAST_EPISODES_RELATION_PROPERTY_ID = Id('88f24615-58b1-4d6c-a45e-81ab9582c282');

const stringifyTypeIds = (typeIds: readonly string[]) => `[${typeIds.map((id) => JSON.stringify(id)).join(', ')}]`;

const Friend = Entity.Schema(
  {
    nickname: Type.String,
  },
  {
    types: FRIEND_TYPES,
    properties: {
      nickname: NAME_PROPERTY_ID,
    },
  },
);

const Child = Entity.Schema(
  {
    name: Type.String,
    friends: Type.Relation(Friend),
  },
  {
    types: CHILD_TYPES,
    properties: {
      name: NAME_PROPERTY_ID,
      friends: FRIENDS_RELATION_PROPERTY_ID,
    },
  },
);

const Parent = Entity.Schema(
  {
    title: Type.String,
    children: Type.Relation(Child),
  },
  {
    types: PARENT_TYPES,
    properties: {
      title: NAME_PROPERTY_ID,
      children: CHILDREN_RELATION_PROPERTY_ID,
    },
  },
);

const Episode = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: EPISODE_TYPES,
    properties: {
      name: NAME_PROPERTY_ID,
    },
  },
);

const Podcast = Entity.Schema(
  {
    title: Type.String,
    episodes: Type.Backlink(Episode),
  },
  {
    types: PODCAST_TYPES,
    properties: {
      title: NAME_PROPERTY_ID,
      episodes: PODCAST_EPISODES_RELATION_PROPERTY_ID,
    },
  },
);

describe('relation include config overrides', () => {
  it('propagates spaces overrides to query fragments', () => {
    const include = {
      children: {
        _config: {
          relationSpaces: ['space-rel', 'space-rel-2'],
          valueSpaces: ['space-values'],
        },
        friends: {
          _config: {
            relationSpaces: 'all',
          },
        },
      },
    } satisfies Entity.EntityInclude<typeof Parent>;

    const relationInfo = getRelationTypeIds(Parent, include);
    const childrenRelationInfo = relationInfo.find((info) => info.propertyName === 'children');
    const childrenAlias = getRelationAlias(
      childrenRelationInfo?.typeId ?? CHILDREN_RELATION_PROPERTY_ID,
      childrenRelationInfo?.targetTypeIds,
    );
    expect(relationInfo[0]).toMatchObject({
      relationSpaces: ['space-rel', 'space-rel-2'],
      valueSpaces: ['space-values'],
    });
    expect(relationInfo[0]?.children?.[0]).toMatchObject({
      relationSpaces: 'all',
    });

    const selection = buildRelationsSelection(relationInfo, 'single');

    expect(selection).toContain('spaceId: {in: ["space-rel", "space-rel-2"]}');
    expect(selection).toContain('valuesList(filter: {spaceId: {in: ["space-values"]}})');
    expect(selection).toContain(`toEntity: { typeIds: { in: ${stringifyTypeIds(CHILD_TYPES)} } }`);
    expect(selection).toContain(`toEntity: { typeIds: { in: ${stringifyTypeIds(FRIEND_TYPES)} } }`);
    expect(selection.split(childrenAlias)[0]).not.toContain('spaceId: {is: $spaceId}');
  });

  it('omits filters entirely when overrides use "all"', () => {
    const include = {
      children: {
        _config: {
          relationSpaces: 'all',
          valueSpaces: 'all',
        },
      },
    } satisfies Entity.EntityInclude<typeof Parent>;

    const relationInfo = getRelationTypeIds(Parent, include);
    const selection = buildRelationsSelection(relationInfo, 'single');

    expect(selection).not.toContain('spaceId: {is: $spaceId}');
    expect(selection).not.toContain('spaceId: {in: $spaceIds}');
    expect(selection).not.toContain('valuesList(filter: {spaceId: {is: $spaceId}})');
    expect(selection).not.toContain('valuesList(filter: {spaceId: {in: $spaceIds}})');
  });

  it('renders match-nothing filters when overrides are empty arrays', () => {
    const include = {
      children: {
        _config: {
          relationSpaces: [],
          valueSpaces: [],
        },
      },
    } satisfies Entity.EntityInclude<typeof Parent>;

    const relationInfo = getRelationTypeIds(Parent, include);
    const selection = buildRelationsSelection(relationInfo, 'single');

    expect(selection).toContain('spaceId: {in: []}');
    expect(selection).toContain('valuesList(filter: {spaceId: {in: []}})');
  });

  it('adds typeIds filter for backlinks', () => {
    const include = {
      episodes: {},
    } satisfies Entity.EntityInclude<typeof Podcast>;

    const relationInfo = getRelationTypeIds(Podcast, include);
    const selection = buildRelationsSelection(relationInfo, 'single');

    expect(selection).toContain(`fromEntity: { typeIds: { in: ${stringifyTypeIds(EPISODE_TYPES)} } }`);
  });
});
