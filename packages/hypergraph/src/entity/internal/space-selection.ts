export type SpaceSelection =
  | {
      mode: 'single';
      spaceId: string;
    }
  | {
      mode: 'many';
      spaceIds: readonly [string, ...string[]];
    }
  | {
      mode: 'all';
    };

export const normalizeSpaceSelection = (
  space: string | undefined,
  spaces: readonly [string, ...string[]] | 'all' | undefined,
): SpaceSelection => {
  if (space && spaces) {
    throw new Error('Provide either "space" or "spaces", not both.');
  }

  if (space) {
    return { mode: 'single', spaceId: space };
  }

  if (spaces === 'all') {
    return { mode: 'all' };
  }

  if (spaces && spaces.length > 0) {
    return { mode: 'many', spaceIds: spaces };
  }

  throw new Error('Either "space" or non-empty "spaces" must be provided.');
};
