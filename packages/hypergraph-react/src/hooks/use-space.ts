'use client';

import { store } from '@graphprotocol/hypergraph';
import { useSelector } from '@xstate/store/react';
import { useHypergraphSpaceInternal } from '../internal/use-hypergraph-space-internal.js';
import { usePublicSpace } from '../internal/use-public-space.js';
import { useSubscribeToSpaceAndGetHandle } from '../internal/use-subscribe-to-space.js';

export function useSpace(options: { space?: string; mode: 'private' | 'public' }) {
  const { space: spaceIdFromContext } = useHypergraphSpaceInternal();
  const { space: spaceIdFromParams } = options ?? {};
  const spaceId = spaceIdFromParams ?? spaceIdFromContext;
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId, enabled: options.mode === 'private' });
  const ready = options.mode === 'public' ? true : handle ? handle.isReady() : false;
  const privateSpace = useSelector(store, (state) => state.context.spaces.find((space) => space.id === spaceId));
  const publicSpace = usePublicSpace({ spaceId, enabled: options.mode === 'public' });
  return { ready, name: options.mode === 'private' ? privateSpace?.name : publicSpace?.name, id: spaceId };
}
