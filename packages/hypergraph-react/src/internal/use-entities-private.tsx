import { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import { useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useHypergraphSpaceInternal } from './use-hypergraph-space-internal.js';
import { useSubscribeToSpaceAndGetHandle } from './use-subscribe-to-space.js';

type QueryParams<S extends Schema.Schema.AnyNoContext> = {
  space?: string | undefined;
  enabled: boolean;
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  include?: Entity.EntityInclude<S> | undefined;
};

export function useEntitiesPrivate<const S extends Schema.Schema.AnyNoContext>(type: S, params?: QueryParams<S>) {
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
