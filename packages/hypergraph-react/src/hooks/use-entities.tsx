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
};

export function useEntities<const S extends Schema.Schema.AnyNoContext>(type: S, params: UseEntitiesParams<S>) {
  const { mode, filter, include, space, first } = params;
  const publicResult = useEntitiesPublic(type, { enabled: mode === 'public', filter, include, first, space });
  const localResult = useEntitiesPrivate(type, { enabled: mode === 'private', filter, include, space });

  if (mode === 'public') {
    return {
      ...publicResult,
      deleted: [],
    };
  }

  return {
    ...publicResult,
    data: localResult.entities,
    deleted: localResult.deletedEntities,
  };
}
