import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useHypergraphApp } from '../HypergraphAppContext.js';
import { useEntitiesPrivate } from '../internal/use-entities-private.js';
import { type UseEntitiesPublicResult, useEntitiesPublic } from '../internal/use-entities-public.js';
import { useHypergraphSpaceInternal } from '../internal/use-hypergraph-space-internal.js';

type SpaceSelectionInputOptionInContext = {
  space?: never;
  spaces?: never;
};

type UseEntitiesParams<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = boolean | undefined,
  Mode extends 'public' | 'private' = 'public' | 'private',
> = (Entity.SpaceSelectionInput | SpaceSelectionInputOptionInContext) & {
  mode: Mode;
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
  first?: number | undefined;
  offset?: number | undefined;
  orderBy?:
    | {
        property: keyof Schema.Schema.Type<S>;
        direction: 'asc' | 'desc';
      }
    | undefined;
  backlinksTotalCountsTypeId1?: string | undefined;
  includeSpaceIds?: IncludeSpaceIds;
  logInvalidResults?: boolean;
};

type UseEntitiesPublicReturn<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined,
> = UseEntitiesPublicResult<S, IncludeSpaceIds> & { deleted: [] };

type UseEntitiesPrivateResult<S extends Schema.Schema.AnyNoContext> = Omit<
  UseEntitiesPublicResult<S, false>,
  'data'
> & {
  data: (Entity.Entity<S> & { backlinksTotalCountsTypeId1?: number })[];
  deleted: Entity.Entity<S>[];
};

type UseEntitiesResult<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined,
  Mode extends 'public' | 'private',
> = Mode extends 'public' ? UseEntitiesPublicReturn<S, IncludeSpaceIds> : UseEntitiesPrivateResult<S>;

export function useEntities<
  const S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = false,
  Mode extends 'public' | 'private' = 'public',
>(type: S, params: UseEntitiesParams<S, IncludeSpaceIds, Mode>): UseEntitiesResult<S, IncludeSpaceIds, Mode> {
  const {
    mode,
    filter,
    include,
    space,
    spaces,
    first,
    offset,
    orderBy,
    backlinksTotalCountsTypeId1,
    includeSpaceIds,
    logInvalidResults: logInvalidResultsParam,
  } = params;
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const { logInvalidResults: contextLogInvalidResults = true } = useHypergraphApp();
  const logInvalidResults = logInvalidResultsParam ?? contextLogInvalidResults ?? true;
  const resolvedSpace = space ?? spaceFromContext;
  const publicSpaceParams = spaces ? { spaces } : { space: resolvedSpace };
  const publicResult = useEntitiesPublic<S, IncludeSpaceIds>(type, {
    enabled: mode === 'public',
    filter,
    include,
    first,
    offset,
    orderBy,
    backlinksTotalCountsTypeId1,
    ...(includeSpaceIds !== undefined ? { includeSpaceIds } : {}),
    ...publicSpaceParams,
    logInvalidResults,
  });
  const localResult = useEntitiesPrivate(type, { enabled: mode === 'private', filter, include, space: resolvedSpace });

  if (mode === 'public') {
    return {
      ...publicResult,
      deleted: [],
    } as UseEntitiesResult<S, IncludeSpaceIds, Mode>;
  }

  return {
    ...publicResult,
    data: localResult.entities as (Entity.Entity<S> & { backlinksTotalCountsTypeId1?: number })[],
    deleted: localResult.deletedEntities,
  } as UseEntitiesResult<S, IncludeSpaceIds, Mode>;
}
