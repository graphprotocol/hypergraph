import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useHypergraphApp } from '../HypergraphAppContext.js';
import { useEntitiesPrivate } from '../internal/use-entities-private.js';
import { useEntitiesPublic } from '../internal/use-entities-public.js';
import { useHypergraphSpaceInternal } from '../internal/use-hypergraph-space-internal.js';

type SpaceSelectionInputOptionInContext = {
  space?: never;
  spaces?: never;
};

type UseEntitiesParams<S extends Schema.Schema.AnyNoContext> = (
  | Entity.SpaceSelectionInput
  | SpaceSelectionInputOptionInContext
) & {
  mode: 'public' | 'private';
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
  logInvalidResults?: boolean;
};

export function useEntities<const S extends Schema.Schema.AnyNoContext>(type: S, params: UseEntitiesParams<S>) {
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
    logInvalidResults: logInvalidResultsParam,
  } = params;
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const { logInvalidResults: contextLogInvalidResults = true } = useHypergraphApp();
  const logInvalidResults = logInvalidResultsParam ?? contextLogInvalidResults ?? true;
  const resolvedSpace = space ?? spaceFromContext;
  const publicSpaceParams = spaces ? { spaces } : { space: resolvedSpace };
  const publicResult = useEntitiesPublic(type, {
    enabled: mode === 'public',
    filter,
    include,
    first,
    offset,
    orderBy,
    backlinksTotalCountsTypeId1,
    ...publicSpaceParams,
    logInvalidResults,
  });
  const localResult = useEntitiesPrivate(type, { enabled: mode === 'private', filter, include, space: resolvedSpace });

  if (mode === 'public') {
    return {
      ...publicResult,
      deleted: [],
    };
  }

  return {
    ...publicResult,
    data: localResult.entities as (Entity.Entity<S> & { backlinksTotalCountsTypeId1?: number })[],
    deleted: localResult.deletedEntities,
  };
}
