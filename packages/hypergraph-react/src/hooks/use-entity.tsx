import type { Entity, Id } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useHypergraphApp } from '../HypergraphAppContext.js';
import { useEntityPrivate } from '../internal/use-entity-private.js';
import { useEntityPublic } from '../internal/use-entity-public.js';

export function useEntity<const S extends Schema.Schema.AnyNoContext>(
  type: S,
  params: {
    id: string | Id;
    space?: string;
    mode: 'private' | 'public';
    include?: Entity.EntityInclude<S> | undefined;
    logInvalidResults?: boolean;
  },
) {
  const { mode, logInvalidResults: logInvalidResultsParam, ...restParams } = params;
  const { logInvalidResults: contextLogInvalidResults = true } = useHypergraphApp();
  const logInvalidResults = logInvalidResultsParam ?? contextLogInvalidResults ?? true;
  const resultPublic = useEntityPublic(type, {
    ...restParams,
    logInvalidResults,
    enabled: mode === 'public',
  });
  const resultPrivate = useEntityPrivate(type, { ...restParams, enabled: mode === 'private' });

  if (mode === 'public') {
    return resultPublic;
  }

  return {
    ...resultPublic,
    data: resultPrivate.data,
    invalidEntity: resultPrivate.invalidEntity,
    invalidRelationEntities: [],
  };
}
