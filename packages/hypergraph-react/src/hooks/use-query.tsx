import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useQueryPrivate } from '../internal/use-query-private.js';
import { useQueryPublic } from '../internal/use-query-public.js';

type QueryParams<S extends Entity.AnyNoContext> = {
  mode: 'public' | 'private';
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
  space?: string | undefined;
  first?: number | undefined;
};

const preparePublishDummy = () => undefined;

export function useQuery<const S extends Entity.AnyNoContext>(type: S, params: QueryParams<S>) {
  const { mode, filter, include, space, first } = params;
  const publicResult = useQueryPublic(type, { enabled: mode === 'public', filter, include, first, space });
  const localResult = useQueryPrivate(type, { enabled: mode === 'private', filter, include, space });

  if (mode === 'public') {
    return {
      ...publicResult,
      deleted: [],
      preparePublish: preparePublishDummy,
    };
  }

  return {
    ...publicResult,
    data: localResult.entities,
    deleted: localResult.deletedEntities,
    preparePublish: preparePublishDummy,
  };
}
