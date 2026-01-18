import { describe, expect, it } from 'vitest';
import { parseSpacesQueryResult } from '../../src/space/find-many-public.js';

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
                            string: avatar,
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
