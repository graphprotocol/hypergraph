'use client';

import { Entity, store } from '@graphprotocol/hypergraph';
import { useSelector } from '@xstate/store/react';
import { createContext, type ReactNode } from 'react';
import { useHypergraphSpaceInternal } from './internal/use-hypergraph-space-internal.js';
import { usePublicSpace } from './internal/use-public-space.js';
import { useSubscribeToSpaceAndGetHandle } from './internal/use-subscribe-to-space.js';

// TODO space can be undefined
export type HypergraphContext = { space: string };

export const HypergraphReactContext = createContext<HypergraphContext | undefined>(undefined);

export function HypergraphSpaceProvider({ space, children }: { space: string; children: ReactNode }) {
  return <HypergraphReactContext.Provider value={{ space }}>{children}</HypergraphReactContext.Provider>;
}

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

export function useCreateEntity<const S extends Entity.AnyNoContext>(type: S, options?: { space?: string }) {
  const { space: spaceIdFromParams } = options ?? {};
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const spaceId = spaceIdFromParams ?? spaceFromContext;
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId, enabled: true });
  if (!handle) {
    return () => {
      throw new Error('Space not found or not ready');
    };
  }
  return Entity.create(handle, type);
}

export function useUpdateEntity<const S extends Entity.AnyNoContext>(type: S, options?: { space?: string }) {
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const { space } = options ?? {};
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId: space ?? spaceFromContext, enabled: true });
  if (!handle) {
    return () => {
      throw new Error('Space not found or not ready');
    };
  }
  return Entity.update(handle, type);
}

export function useDeleteEntity(options?: { space?: string }) {
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const { space } = options ?? {};
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId: space ?? spaceFromContext, enabled: true });
  if (!handle) {
    return () => {
      throw new Error('Space not found or not ready');
    };
  }
  return Entity.markAsDeleted(handle);
}

export function useRemoveRelation(options?: { space?: string }) {
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const { space } = options ?? {};
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId: space ?? spaceFromContext, enabled: true });
  if (!handle) {
    return () => {
      throw new Error('Space not found or not ready');
    };
  }
  return Entity.removeRelation(handle);
}

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
