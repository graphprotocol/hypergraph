import { Duration, Effect } from 'effect';
import type { SpacesConfig } from './config.js';
import { PrefetchError } from './errors.js';
import type { EntitiesResult, TypesListResult } from './graphql-client.js';
import { fetchEntities, fetchTypes } from './graphql-client.js';

export type PrefetchedType = {
  id: string;
  name: string | null;
  properties: Array<{ id: string; name: string | null; dataType: string }>;
};

export type PrefetchedEntity = EntitiesResult['entities'][number];

export type PrefetchedSpace = {
  spaceName: string;
  spaceId: string;
  types: PrefetchedType[];
  entities: PrefetchedEntity[];
};

const PAGE_SIZE = 10000;

const fetchAllEntities = async (endpoint: string, spaceId: string): Promise<PrefetchedEntity[]> => {
  const all: PrefetchedEntity[] = [];
  let offset = 0;

  // biome-ignore lint/correctness/noConstantCondition: pagination loop
  while (true) {
    const page = await fetchEntities(endpoint, spaceId, PAGE_SIZE, offset);
    all.push(...page);

    if (page.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return all;
};

const mapTypes = (
  rawTypes: TypesListResult['typesList'],
): PrefetchedType[] => {
  const types = rawTypes ?? [];
  return types.map((t) => ({
    id: t.id,
    name: t.name,
    properties: (t.properties ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      dataType: p.dataType,
    })),
  }));
};

const prefetchSpace = (
  spaceId: string,
  spaceName: string,
  endpoint: string,
): Effect.Effect<PrefetchedSpace, PrefetchError> =>
  Effect.tryPromise({
    try: async () => {
      const [rawTypes, entities] = await Promise.all([
        fetchTypes(endpoint, spaceId),
        fetchAllEntities(endpoint, spaceId),
      ]);
      return {
        spaceName,
        spaceId,
        types: mapTypes(rawTypes),
        entities,
      };
    },
    catch: (cause) => new PrefetchError({ space: spaceName, cause }),
  });

export const prefetchAll = (config: SpacesConfig): Effect.Effect<PrefetchedSpace[], PrefetchError> =>
  Effect.forEach(config.spaces, (space) => prefetchSpace(space.id, space.name, config.endpoint), {
    concurrency: 'unbounded',
  }).pipe(
    Effect.timeout(Duration.minutes(2)),
    Effect.catchTag('TimeoutException', () =>
      Effect.fail(
        new PrefetchError({
          space: 'all',
          cause: 'Prefetch exceeded 2-minute timeout',
        }),
      ),
    ),
  );
