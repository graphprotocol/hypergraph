import { Duration, Effect } from 'effect';
import type { SpacesConfig } from './config.js';
import { PrefetchError } from './errors.js';
import { fetchEntities, fetchTypes } from './graphql-client.js';

export type PrefetchedSpace = {
  spaceName: string;
  spaceId: string;
  types: Array<{ id: string; name: string | null }>;
  entities: Array<{ id: string; name: string | null; typeIds: string[] }>;
};

const prefetchSpace = (
  spaceId: string,
  spaceName: string,
  endpoint: string,
): Effect.Effect<PrefetchedSpace, PrefetchError> =>
  Effect.tryPromise({
    try: async () => {
      const [types, entities] = await Promise.all([
        fetchTypes(endpoint, spaceId),
        fetchEntities(endpoint, spaceId, 1000, 0),
      ]);
      return {
        spaceName,
        spaceId,
        types,
        entities: entities.map((e) => ({
          id: e.id,
          name: e.name,
          typeIds: e.typeIds,
        })),
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
