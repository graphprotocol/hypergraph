import { describe, expect, it } from 'vitest';
import { buildFilterString, buildSpacesQuery, parseSpacesQueryResult } from '../../src/space/find-many-public.js';

const buildQuerySpace = ({
  id = 'space-id',
  type = 'PERSONAL',
  name = 'Space name',
  avatar,
  editorsList = [],
  membersList = [],
}: {
  id?: string;
  type?: 'PERSONAL' | 'DAO';
  name?: string | null;
  avatar?: string | null;
  editorsList?: { memberSpaceId: string }[];
  membersList?: { memberSpaceId: string }[];
} = {}) => {
  return {
    id,
    type,
    page: {
      name,
      relationsList:
        avatar === undefined
          ? []
          : [
              {
                toEntity: {
                  valuesList:
                    avatar === null
                      ? []
                      : [
                          {
                            propertyId: '8a743832c0944a62b6650c3cc2f9c7bc',
                            text: avatar,
                          },
                        ],
                },
              },
            ],
    },
    editorsList,
    membersList,
  };
};

describe('parseSpacesQueryResult', () => {
  it('parses valid data', () => {
    const { data, invalidSpaces } = parseSpacesQueryResult({
      spaces: [buildQuerySpace({ id: 'space-1', name: 'Space 1', avatar: 'https://example.com/avatar.png' })],
    });

    expect(data).toEqual([
      {
        id: 'space-1',
        type: 'PERSONAL',
        name: 'Space 1',
        avatar: 'https://example.com/avatar.png',
        editorIds: [],
        memberIds: [],
      },
    ]);
    expect(invalidSpaces).toHaveLength(0);
  });

  it('omits avatar when not provided', () => {
    const { data } = parseSpacesQueryResult({
      spaces: [buildQuerySpace({ id: 'space-2', name: 'Space 2', avatar: undefined })],
    });

    expect(data).toEqual([
      {
        id: 'space-2',
        type: 'PERSONAL',
        name: 'Space 2',
        editorIds: [],
        memberIds: [],
      },
    ]);
  });

  it('parses DAO type', () => {
    const { data } = parseSpacesQueryResult({
      spaces: [buildQuerySpace({ id: 'space-dao', type: 'DAO', name: 'DAO Space' })],
    });

    expect(data).toEqual([
      {
        id: 'space-dao',
        type: 'DAO',
        name: 'DAO Space',
        editorIds: [],
        memberIds: [],
      },
    ]);
  });

  it('filters invalid data', () => {
    const { data, invalidSpaces } = parseSpacesQueryResult({
      spaces: [
        buildQuerySpace({ id: 'space-valid', name: 'Space valid', avatar: 'https://example.com/a.png' }),
        buildQuerySpace({ id: 'space-invalid', name: null, avatar: 'https://example.com/b.png' }),
      ],
    });

    expect(data).toEqual([
      {
        id: 'space-valid',
        type: 'PERSONAL',
        name: 'Space valid',
        avatar: 'https://example.com/a.png',
        editorIds: [],
        memberIds: [],
      },
    ]);
    expect(invalidSpaces).toHaveLength(1);
    expect(invalidSpaces[0]).toMatchObject({ id: 'space-invalid' });
  });

  it('parses editorIds and memberIds', () => {
    const { data } = parseSpacesQueryResult({
      spaces: [
        buildQuerySpace({
          id: 'space-with-members',
          name: 'Space with members',
          editorsList: [{ memberSpaceId: 'editor-1' }, { memberSpaceId: 'editor-2' }],
          membersList: [{ memberSpaceId: 'member-1' }],
        }),
      ],
    });

    expect(data).toEqual([
      {
        id: 'space-with-members',
        type: 'PERSONAL',
        name: 'Space with members',
        editorIds: ['editor-1', 'editor-2'],
        memberIds: ['member-1'],
      },
    ]);
  });
});

describe('buildFilterString', () => {
  it('returns undefined when no filter is provided', () => {
    expect(buildFilterString()).toBeUndefined();
    expect(buildFilterString({})).toBeUndefined();
  });

  it('builds filter string with memberId', () => {
    const result = buildFilterString({ memberId: '1e5e39daa00d4fd8b53b98095337112f' });
    expect(result).toBe('filter: {members: {some: {memberSpaceId: {is: "1e5e39daa00d4fd8b53b98095337112f"}}}}');
  });

  it('builds filter string with editorId', () => {
    const result = buildFilterString({ editorId: '1e5e39daa00d4fd8b53b98095337112f' });
    expect(result).toBe('filter: {editors: {some: {memberSpaceId: {is: "1e5e39daa00d4fd8b53b98095337112f"}}}}');
  });

  it('builds filter string with spaceType PERSONAL', () => {
    const result = buildFilterString({ spaceType: 'PERSONAL' });
    expect(result).toBe('filter: {type: {is: PERSONAL}}');
  });

  it('builds filter string with spaceType DAO', () => {
    const result = buildFilterString({ spaceType: 'DAO' });
    expect(result).toBe('filter: {type: {is: DAO}}');
  });

  it('builds filter string with memberId and spaceType', () => {
    const result = buildFilterString({ memberId: '1e5e39daa00d4fd8b53b98095337112f', spaceType: 'PERSONAL' });
    expect(result).toBe(
      'filter: {members: {some: {memberSpaceId: {is: "1e5e39daa00d4fd8b53b98095337112f"}}}, type: {is: PERSONAL}}',
    );
  });

  it('builds filter string with editorId and spaceType', () => {
    const result = buildFilterString({ editorId: '1e5e39daa00d4fd8b53b98095337112f', spaceType: 'DAO' });
    expect(result).toBe(
      'filter: {editors: {some: {memberSpaceId: {is: "1e5e39daa00d4fd8b53b98095337112f"}}}, type: {is: DAO}}',
    );
  });

  it('normalizes UUID with dashes to dashless format', () => {
    const result = buildFilterString({ memberId: '1e5e39da-a00d-4fd8-b53b-98095337112f' });
    expect(result).toBe('filter: {members: {some: {memberSpaceId: {is: "1e5e39daa00d4fd8b53b98095337112f"}}}}');
  });

  it('throws error for invalid memberId', () => {
    expect(() => buildFilterString({ memberId: 'invalid-id' })).toThrow('Invalid Geo ID');
  });

  it('throws error for invalid editorId', () => {
    expect(() => buildFilterString({ editorId: 'invalid"; DROP TABLE spaces; --' })).toThrow('Invalid Geo ID');
  });

  it('throws error for invalid spaceType', () => {
    // @ts-expect-error - testing runtime validation with invalid value
    expect(() => buildFilterString({ spaceType: 'INVALID' })).toThrow(
      "Invalid spaceType: INVALID. Must be 'PERSONAL' or 'DAO'.",
    );
  });
});

describe('buildSpacesQuery', () => {
  it('builds query without filter', () => {
    const query = buildSpacesQuery();
    expect(query).toContain('query spaces {');
    // Check that the top-level spaces query doesn't have a filter (spaces { not spaces(filter:)
    expect(query).toMatch(/spaces\s*\{/);
    expect(query).not.toMatch(/spaces\s*\(filter:/);
  });

  it('builds query with memberId filter', () => {
    const query = buildSpacesQuery({ memberId: '1e5e39daa00d4fd8b53b98095337112f' });
    expect(query).toContain(
      'spaces(filter: {members: {some: {memberSpaceId: {is: "1e5e39daa00d4fd8b53b98095337112f"}}}})',
    );
  });

  it('builds query with editorId filter', () => {
    const query = buildSpacesQuery({ editorId: '1e5e39daa00d4fd8b53b98095337112f' });
    expect(query).toContain(
      'spaces(filter: {editors: {some: {memberSpaceId: {is: "1e5e39daa00d4fd8b53b98095337112f"}}}})',
    );
  });

  it('builds query with spaceType filter only', () => {
    const query = buildSpacesQuery({ spaceType: 'DAO' });
    expect(query).toContain('spaces(filter: {type: {is: DAO}})');
  });

  it('builds query with combined filters', () => {
    const query = buildSpacesQuery({ memberId: '1e5e39daa00d4fd8b53b98095337112f', spaceType: 'PERSONAL' });
    expect(query).toContain(
      'spaces(filter: {members: {some: {memberSpaceId: {is: "1e5e39daa00d4fd8b53b98095337112f"}}}, type: {is: PERSONAL}})',
    );
  });

  it('includes required space fields in query', () => {
    const query = buildSpacesQuery();
    expect(query).toContain('id');
    expect(query).toContain('type');
    expect(query).toContain('page {');
    expect(query).toContain('editorsList {');
    expect(query).toContain('membersList {');
  });
});
