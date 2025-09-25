'use client';

import { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useHypergraphSpaceInternal } from '../internal/use-hypergraph-space-internal.js';
import { useSubscribeToSpaceAndGetHandle } from '../internal/use-subscribe-to-space.js';

export function useCreateEntity<const S extends Schema.Schema.AnyNoContext>(type: S, options?: { space?: string }) {
  const { space: spaceIdFromParams } = options ?? {};
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const spaceId = spaceIdFromParams ?? spaceFromContext;
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId, enabled: true });
  if (!handle) {
    return () => {
      throw new Error('Space not found or not ready');
    };
  }
  return Entity.createNew(handle, type);
}
