export const normalizeSpaceIds = (spaceIds?: readonly (string | null)[] | null) =>
  spaceIds?.filter((spaceId): spaceId is string => Boolean(spaceId)) ?? [];
