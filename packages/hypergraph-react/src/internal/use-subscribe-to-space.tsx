import { store } from '@graphprotocol/hypergraph';
import { useSelector } from '@xstate/store/react';
import { useEffect } from 'react';
import { useHypergraphApp } from '../HypergraphAppContext.js';

const subscribeToSpaceCache = new Map<string, boolean>();

export function useSubscribeToSpaceAndGetHandle({ spaceId, enabled }: { spaceId: string; enabled: boolean }) {
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
