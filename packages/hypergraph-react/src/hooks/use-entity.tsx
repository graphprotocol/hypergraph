import type { Id } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useEntityPrivate } from '../internal/use-entity-private.js';
import { useEntityPublic } from '../internal/use-entity-public.js';

export function useEntity<const S extends Schema.Schema.AnyNoContext>(
  type: S,
  params: {
    id: string | Id;
    space?: string;
    mode: 'private' | 'public';
    include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
  },
) {
  const resultPublic = useEntityPublic(type, { ...params, enabled: params.mode === 'public' });
  const resultPrivate = useEntityPrivate(type, { ...params, enabled: params.mode === 'private' });

  if (params.mode === 'public') {
    return resultPublic;
  }

  return resultPrivate;
}
