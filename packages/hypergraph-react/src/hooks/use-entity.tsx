import type { Entity, Id } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useHypergraphApp } from '../HypergraphAppContext.js';
import { useEntityPrivate } from '../internal/use-entity-private.js';
import { type UseEntityPublicResult, useEntityPublic } from '../internal/use-entity-public.js';

type UseEntityParams<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = boolean | undefined,
  Mode extends 'private' | 'public' = 'private' | 'public',
> = {
  id: string | Id;
  space?: string;
  mode: Mode;
  include?: Entity.EntityInclude<S> | undefined;
  includeSpaceIds?: IncludeSpaceIds;
  logInvalidResults?: boolean;
};

type UseEntityPrivateResult<S extends Schema.Schema.AnyNoContext> = Omit<
  UseEntityPublicResult<S, false>,
  'data' | 'invalidEntity' | 'invalidRelationEntities'
> & {
  data: Entity.Entity<S> | undefined;
  invalidEntity: Entity.InvalidEntity | undefined;
  invalidRelationEntities: [];
};

type UseEntityResult<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined,
  Mode extends 'public' | 'private',
> = Mode extends 'public' ? UseEntityPublicResult<S, IncludeSpaceIds> : UseEntityPrivateResult<S>;

export function useEntity<
  const S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = false,
  Mode extends 'public' | 'private' = 'public',
>(type: S, params: UseEntityParams<S, IncludeSpaceIds, Mode>): UseEntityResult<S, IncludeSpaceIds, Mode> {
  const { mode, includeSpaceIds, logInvalidResults: logInvalidResultsParam, ...restParams } = params;
  const { logInvalidResults: contextLogInvalidResults = true } = useHypergraphApp();
  const logInvalidResults = logInvalidResultsParam ?? contextLogInvalidResults ?? true;
  const resultPublic = useEntityPublic<S, IncludeSpaceIds>(type, {
    ...restParams,
    ...(includeSpaceIds !== undefined ? { includeSpaceIds } : {}),
    logInvalidResults,
    enabled: mode === 'public',
  });
  const resultPrivate = useEntityPrivate(type, { ...restParams, enabled: mode === 'private' });

  if (mode === 'public') {
    return resultPublic as UseEntityResult<S, IncludeSpaceIds, Mode>;
  }

  return {
    ...resultPublic,
    data: resultPrivate.data,
    invalidEntity: resultPrivate.invalidEntity,
    invalidRelationEntities: [],
  } as UseEntityResult<S, IncludeSpaceIds, Mode>;
}
