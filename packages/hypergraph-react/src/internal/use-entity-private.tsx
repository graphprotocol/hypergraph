'use client';

import { Entity, type Id, store } from '@graphprotocol/hypergraph';
import { useSelector } from '@xstate/store/react';
import * as Schema from 'effect/Schema';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useHypergraphApp } from '../HypergraphAppContext.js';
import { useHypergraphSpaceInternal } from '../HypergraphSpaceContext.js';

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

export function useEntityPrivate<const S extends Entity.AnyNoContext>(
  type: S,
  params: {
    id: string | Id;
    enabled?: boolean;
    space?: string;
    include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
  },
) {
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const { space: spaceFromParams, include, id, enabled = true } = params;
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId: spaceFromParams ?? spaceFromContext, enabled });
  const prevEntityRef = useRef<{
    data: Entity.Entity<S> | undefined;
    invalidEntity: Record<string, string | boolean | number | Date> | undefined;
    isPending: boolean;
    isError: boolean;
  }>({ data: undefined, invalidEntity: undefined, isPending: false, isError: false });
  const equals = Schema.equivalence(type);

  const subscribe = (callback: () => void) => {
    if (!handle || !enabled) {
      return () => {};
    }
    const handleChange = () => {
      callback();
    };

    const handleDelete = () => {
      callback();
    };

    handle.on('change', handleChange);
    handle.on('delete', handleDelete);

    return () => {
      handle.off('change', handleChange);
      handle.off('delete', handleDelete);
    };
  };

  return useSyncExternalStore(subscribe, () => {
    if (!handle || !enabled) {
      return prevEntityRef.current;
    }
    const doc = handle.doc();
    if (doc === undefined) {
      return prevEntityRef.current;
    }

    const found = Entity.findOne(handle, type, include)(id);
    if (found === undefined && prevEntityRef.current.data !== undefined) {
      // entity was maybe deleted, delete from the ref
      prevEntityRef.current = { data: undefined, invalidEntity: undefined, isPending: false, isError: false };
    } else if (found !== undefined && prevEntityRef.current.data === undefined) {
      prevEntityRef.current = { data: found, invalidEntity: undefined, isPending: false, isError: false };
    } else if (
      found !== undefined &&
      prevEntityRef.current.data !== undefined &&
      !equals(found, prevEntityRef.current.data)
    ) {
      // found and ref have a value, compare for equality, if they are not equal, update the ref and return
      prevEntityRef.current = { data: found, invalidEntity: undefined, isPending: false, isError: false };
    }

    return prevEntityRef.current;
  });
}
