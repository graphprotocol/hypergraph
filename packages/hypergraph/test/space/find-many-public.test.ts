import { describe, expect, it } from 'vitest';
import { parseSpacesQueryResult } from '../../src/space/find-many-public.js';

const buildQuerySpace = ({
  id = 'space-id',
  name = 'Space name',
  avatar,
}: {
  id?: string;
  name?: string | null;
  avatar?: string | null;
} = {}) => {
  return {
    id,
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
                            propertyId: '8a743832-c094-4a62-b665-0c3cc2f9c7bc',
                            string: avatar,
                          },
                        ],
                },
              },
            ],
    },
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
        name: 'Space 1',
        avatar: 'https://example.com/avatar.png',
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
        name: 'Space 2',
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
        name: 'Space valid',
        avatar: 'https://example.com/a.png',
      },
    ]);
    expect(invalidSpaces).toHaveLength(1);
    expect(invalidSpaces[0]).toMatchObject({ id: 'space-invalid' });
  });
});
