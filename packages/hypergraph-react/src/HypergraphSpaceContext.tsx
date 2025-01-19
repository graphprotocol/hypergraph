'use client';

import { Repo } from '@automerge/automerge-repo';
import { RepoContext, useRepo } from '@automerge/automerge-repo-react-hooks';
import {
  QueryClient,
  QueryClientProvider,
  type UseMutationOptions,
  type UseQueryOptions,
  defaultShouldDehydrateQuery,
  isServer,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { type ReactNode, createContext, useContext } from 'react';

import { Schema, Utils } from '@graphprotocol/hypergraph';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery(query) {
          return defaultShouldDehydrateQuery(query) || query.state.status === 'pending';
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

//#region HypergraphSpaceContext

export type HypergraphSpaceCtx = {
  repo: Repo;
  defaultSpaceId: string;
  defaultAutomergeDocId: string;
  spaces: Readonly<Array<string>>;
};

export const HypergraphSpaceContext = createContext<HypergraphSpaceCtx | null>(null);

export function useHypergraphSpace() {
  const context = useContext(HypergraphSpaceContext);
  if (!context) {
    throw new Error('useHypergraphSpace must be used within a HypergraphSpaceProvider');
  }

  return context as HypergraphSpaceCtx;
}

export function useHypergraphDefaultSpaceId() {
  const context = useHypergraphSpace();
  return context.defaultSpaceId;
}

export function useHypergraphSpaces() {
  const context = useHypergraphSpace();
  return context.spaces ?? [];
}

export function useHypergraphDefaultAutomergeDocId() {
  const context = useHypergraphSpace();
  return context.defaultAutomergeDocId;
}

export type HypergraphSpaceProviderProps = Readonly<{
  queryClient?: QueryClient;
  repo?: Repo;
  defaultSpaceId: HypergraphSpaceCtx['defaultSpaceId'];
  spaces?: HypergraphSpaceCtx['spaces'];
  children: ReactNode;
}>;
export function HypergraphSpaceProvider(props: HypergraphSpaceProviderProps) {
  const repo = props.repo ?? new Repo({});

  return (
    <QueryClientProvider client={props.queryClient ?? getQueryClient()}>
      <RepoContext.Provider value={repo}>
        <HypergraphSpaceContext.Provider
          value={{
            repo,
            defaultSpaceId: props.defaultSpaceId,
            defaultAutomergeDocId: Utils.idToAutomergeId(props.defaultSpaceId),
            spaces: props.spaces ?? [],
          }}
        >
          {props.children}
        </HypergraphSpaceContext.Provider>
      </RepoContext.Provider>
    </QueryClientProvider>
  );
}

//#endregion

//#region react-query hook wrappers

export type SpaceId = string;
export type EntityId = string;
export type ModelTypeName = string;
export type HypergraphQueryKey =
  | readonly ['Space', SpaceId, 'entities', readonly [ModelTypeName, ...ModelTypeName[]]]
  | readonly ['Space', SpaceId, 'entities', EntityId, readonly [ModelTypeName, ...ModelTypeName[]]];
/**
 * Util function to build a common query key when querying entities from a Space.
 * This consitency is important as it makes doing things like:
 * - invalidating after a mutation
 * - optimistically updating data in the cache during a mutation
 * easier; which makes interacting with the react-query cache easier.
 * @param param0 contains the spaceId, types being queried, and maybe an entity id
 * @returns the built react-query query key for querying entities in the space
 */
export function buildHypergraphQueryKey<const S extends Schema.AnyNoContext>({
  spaceId,
  type,
  entityId,
}: Readonly<{
  spaceId: string;
  type: S | Readonly<Array<S>>;
  entityId?: string;
}>): HypergraphQueryKey {
  const types = Array.isArray(type) ? type : [type];
  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeNames = types.map((t) => t.name) as readonly [ModelTypeName, ...ModelTypeName[]];
  if (entityId == null) {
    return ['Space', spaceId, 'entities', typeNames] as const;
  }
  return ['Space', spaceId, 'entities', entityId, typeNames] as const;
}

export type UseCreateEntityVariables<S extends Schema.AnyNoContext> = Readonly<Schema.CreateEntityArgs<S>>;
export function useCreateEntity<const S extends Schema.AnyNoContext>(
  type: S,
  options: Omit<
    UseMutationOptions<Schema.Entity<S>, Error, UseCreateEntityVariables<S>>,
    'mutationKey' | 'mutationFn'
  > = {},
) {
  const client = useQueryClient();

  const repo = useRepo();
  const spaceId = useHypergraphDefaultSpaceId();
  const autoMergeDocId = useHypergraphDefaultAutomergeDocId();

  return useMutation<Schema.Entity<S>, Error, UseCreateEntityVariables<S>>({
    mutationKey: ['Space', spaceId, 'entities', 'create'] as const,
    async mutationFn(vars) {
      return Promise.resolve(Schema.createEntity(repo, autoMergeDocId, type, vars));
    },
    async onSuccess(data) {
      // add the created entity to the array of entities at the derived given query key
      client.setQueryData<Readonly<Array<Schema.Entity<S>>>>(buildHypergraphQueryKey<S>({ spaceId, type }), (curr) => {
        if (curr == null || curr.length === 0) {
          return [data] as const;
        }
        return [...curr, data] as const;
      });
      // optimistically updates the useQueryEntity query for the newly created entity
      await client.setQueryData<Schema.Entity<S>, HypergraphQueryKey>(
        buildHypergraphQueryKey<S>({ spaceId, type, entityId: data.id }),
        data,
      );
    },
    ...options,
  });
}

export type UseUpdateEntityVariables<S extends Schema.AnyNoContext> = Schema.UpdateEntityArgs<S>;
export function useUpdateEntity<const S extends Schema.AnyNoContext>(
  type: S,
  options: Omit<
    UseMutationOptions<Schema.Entity<S>, Error, UseUpdateEntityVariables<S>>,
    'mutationKey' | 'mutationFn'
  > = {},
) {
  const client = useQueryClient();

  const repo = useRepo();
  const spaceId = useHypergraphDefaultSpaceId();
  const autoMergeDocId = useHypergraphDefaultAutomergeDocId();

  return useMutation<Schema.Entity<S>, Error, UseUpdateEntityVariables<S>>({
    mutationKey: ['Space', spaceId, 'entities', 'update'] as const,
    async mutationFn(vars) {
      return Promise.resolve(Schema.updateEntity(repo, autoMergeDocId, type, vars));
    },
    async onSuccess(data) {
      // update the entity in the array of entities at the derived query key
      client.setQueryData<Readonly<Array<Schema.Entity<S>>>>(buildHypergraphQueryKey<S>({ spaceId, type }), (curr) => {
        if (curr == null || curr.length === 0) {
          return [data] as const;
        }
        const found = curr.find((entity) => entity.id === data.id);
        if (!found) {
          return [...curr, data] as const;
        }

        return curr.map((entity) => (entity.id === data.id ? data : entity));
      });
      // optimistically updates the useQueryEntity query with the updated entity
      await client.setQueryData(buildHypergraphQueryKey<S>({ spaceId, type, entityId: data.id }), data);
    },
    ...options,
  });
}

export type UseDeleteEntityVariables = Readonly<{
  id: string;
}>;
export function useDeleteEntity<const S extends Schema.AnyNoContext>(
  type: S,
  options: Omit<UseMutationOptions<boolean, Error, UseDeleteEntityVariables>, 'mutationKey' | 'mutationFn'> = {},
) {
  const client = useQueryClient();

  const repo = useRepo();
  const spaceId = useHypergraphDefaultSpaceId();
  const autoMergeDocId = useHypergraphDefaultAutomergeDocId();

  return useMutation<boolean, Error, UseDeleteEntityVariables>({
    mutationKey: ['Space', spaceId, 'entities', 'delete'],
    async mutationFn(vars) {
      return Promise.resolve(Schema.deleteEntity(repo, autoMergeDocId, vars.id));
    },
    async onSuccess(_, vars) {
      // removes the entity from the current entities at the query key
      client.setQueryData<Readonly<Array<Schema.Entity<S>>>>(buildHypergraphQueryKey<S>({ spaceId, type }), (curr) => {
        return (curr ?? []).filter((entity) => entity.id !== vars.id);
      });
      // update the QueryClient cache to return null for the entity with the given id
      await client.setQueryData(buildHypergraphQueryKey({ spaceId, type, entityId: vars.id }), null);
    },
    ...options,
  });
}

export type UseQueryEntitiesResultType<S extends Schema.AnyNoContext> = Readonly<Array<Schema.Entity<S>>>;
export function useQueryEntities<const S extends Schema.AnyNoContext>(
  type: S | Readonly<Array<S>>,
  options: Omit<UseQueryOptions<UseQueryEntitiesResultType<S>>, 'queryKey' | 'queryFn'> = {},
) {
  const repo = useRepo();
  const spaceId = useHypergraphDefaultSpaceId();
  const autoMergeDocId = useHypergraphDefaultAutomergeDocId();

  const queryKey = buildHypergraphQueryKey<S>({ spaceId, type });

  return useQuery<UseQueryEntitiesResultType<S>>({
    queryKey,
    async queryFn() {
      return Promise.resolve(Schema.findMany(repo, autoMergeDocId, type));
    },
    ...options,
  });
}

export type UseQueryEntityResultType<S extends Schema.AnyNoContext> = Readonly<Schema.Entity<S> | null>;
export function useQueryEntity<const S extends Schema.AnyNoContext>(
  type: S,
  id: string,
  options: Omit<UseQueryOptions<UseQueryEntityResultType<S>>, 'queryKey' | 'queryFn'> = {},
) {
  const repo = useRepo();
  const spaceId = useHypergraphDefaultSpaceId();
  const autoMergeDocId = useHypergraphDefaultAutomergeDocId();

  const queryKey = buildHypergraphQueryKey<S>({ spaceId, type, entityId: id });

  return useQuery<UseQueryEntityResultType<S>>({
    queryKey,
    async queryFn() {
      return Promise.resolve(Schema.findOne(repo, autoMergeDocId, type, id));
    },
    ...options,
  });
}

//#endregion
