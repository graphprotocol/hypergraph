'use client';

import { Entity } from '@graphprotocol/hypergraph';
import { useHypergraphSpaceInternal } from '../internal/use-hypergraph-space-internal.js';
import { useSubscribeToSpaceAndGetHandle } from '../internal/use-subscribe-to-space.js';

export function useHardDeleteEntity(options?: { space?: string }) {
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const { space } = options ?? {};
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId: space ?? spaceFromContext, enabled: true });
  if (!handle) {
    return () => {
      throw new Error('Space not found or not ready');
    };
  }
  return Entity.delete(handle);
}
