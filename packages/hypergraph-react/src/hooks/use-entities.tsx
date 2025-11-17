import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useEntitiesPrivate } from '../internal/use-entities-private.js';
import { useEntitiesPublic } from '../internal/use-entities-public.js';

type UseEntitiesParams<S extends Schema.Schema.AnyNoContext> = {
  mode: 'public' | 'private';
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
  space?: string | undefined;
  first?: number | undefined;
  offset?: number | undefined;
  orderBy?:
    | {
        property: keyof Schema.Schema.Type<S>;
        direction: 'asc' | 'desc';
      }
    | undefined;
  backlinksTotalCountsTypeId1?: string | undefined;
};

export function useEntities<const S extends Schema.Schema.AnyNoContext>(type: S, params: UseEntitiesParams<S>) {
  const { mode, filter, include, space, first, offset, orderBy, backlinksTotalCountsTypeId1 } = params;
  const publicResult = useEntitiesPublic(type, {
    enabled: mode === 'public',
    filter,
    include,
    first,
    offset,
    space,
    orderBy,
    backlinksTotalCountsTypeId1,
  });
  const localResult = useEntitiesPrivate(type, { enabled: mode === 'private', filter, include, space });

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
