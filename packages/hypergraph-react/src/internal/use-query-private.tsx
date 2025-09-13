'use client';

import { Entity, store } from '@graphprotocol/hypergraph';
import { useSelector } from '@xstate/store/react';
import type * as Schema from 'effect/Schema';
import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
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

type QueryParams<S extends Entity.AnyNoContext> = {
  space?: string | undefined;
  enabled: boolean;
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
};

export function useQueryPrivate<const S extends Entity.AnyNoContext>(type: S, params?: QueryParams<S>) {
  const { enabled = true, filter, include, space: spaceFromParams } = params ?? {};
  const entitiesRef = useRef<Entity.Entity<S>[]>([]);
  const subscriptionRef = useRef<Entity.FindManySubscription<S>>({
    subscribe: () => () => undefined,
    getEntities: () => entitiesRef.current,
  });
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const handle = useSubscribeToSpaceAndGetHandle({ spaceId: spaceFromParams ?? spaceFromContext, enabled });
  const handleIsReady = handle ? handle.isReady() : false;

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow to change filter and include
  useLayoutEffect(() => {
    if (enabled && handle && handleIsReady) {
      const subscription = Entity.subscribeToFindMany(handle, type, filter, include);
      subscriptionRef.current.subscribe = subscription.subscribe;
      subscriptionRef.current.getEntities = subscription.getEntities;
    }
  }, [enabled, handleIsReady, handle, type]);

  // TODO: allow to change the enabled state
  const allEntities = useSyncExternalStore(
    subscriptionRef.current.subscribe,
    subscriptionRef.current.getEntities,
    () => entitiesRef.current,
  );

  const { entities, deletedEntities } = useMemo(() => {
    const entities: Entity.Entity<S>[] = [];
    const deletedEntities: Entity.Entity<S>[] = [];
    for (const entity of allEntities) {
      if (entity.__deleted === true) {
        deletedEntities.push(entity);
      } else {
        entities.push(entity);
      }
    }
    return { entities, deletedEntities };
  }, [allEntities]);

  return { entities, deletedEntities };
}
