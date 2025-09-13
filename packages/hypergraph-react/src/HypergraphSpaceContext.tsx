'use client';

import { Entity, store } from '@graphprotocol/hypergraph';
import { useSelector } from '@xstate/store/react';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { useHypergraphApp } from './HypergraphAppContext.js';
import { usePublicSpace } from './internal/use-public-space.js';

// TODO space can be undefined
export type HypergraphContext = { space: string };

export const HypergraphReactContext = createContext<HypergraphContext | undefined>(undefined);

export function useHypergraphSpaceInternal() {
  const context = useContext(HypergraphReactContext);
  return (context as HypergraphContext) || { space: '' };
}

export function HypergraphSpaceProvider({ space, children }: { space: string; children: ReactNode }) {
  return <HypergraphReactContext.Provider value={{ space }}>{children}</HypergraphReactContext.Provider>;
}

const subscribeToSpaceCache = new Map<string, boolean>();

function useSubscribeToSpaceAndGetHandle({ spaceId, enabled }: { spaceId: string; enabled: boolean }) {
  const handle = useSelector(store, (state) => {
    const space = state.context.spaces.find((space) => space.id === spaceId);
    if (!space) {
      return undefined;
    }
    return space.automergeDocHandle;
  });

  const { subscribeToSpace, isConnecting } = useHypergraphApp();
  useEffect(() => {
    if (!isConnecting && enabled) {
      if (subscribeToSpaceCache.has(spaceId)) {
        return;
      }
      subscribeToSpaceCache.set(spaceId, true);
      subscribeToSpace({ spaceId });
    }
    return () => {
      // TODO: unsubscribe from space in case the space ID changes
      subscribeToSpaceCache.delete(spaceId);
    };
  }, [isConnecting, subscribeToSpace, spaceId, enabled]);

  return handle;
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
