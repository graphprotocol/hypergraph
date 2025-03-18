'use client';

import type { AnyDocumentId, DocHandle, Repo } from '@automerge/automerge-repo';
import { useRepo } from '@automerge/automerge-repo-react-hooks';
import { Entity, Utils } from '@graphprotocol/hypergraph';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Schema from 'effect/Schema';
import { type ReactNode, createContext, useContext, useRef, useState, useSyncExternalStore } from 'react';
import type { Mapping } from './types.js';

export type HypergraphContext = {
  space: string;
  repo: Repo;
  id: AnyDocumentId;
  handle: DocHandle<Entity.DocumentContent>;
  mapping?: Mapping | undefined;
};

export const HypergraphReactContext = createContext<HypergraphContext | undefined>(undefined);

export function useHypergraph() {
  const context = useContext(HypergraphReactContext);
  if (!context) {
    throw new Error('useHypergraphSpace must be used within a HypergraphSpaceProvider');
  }

  return context as HypergraphContext;
}

const queryClient = new QueryClient();

export function HypergraphSpaceProvider({
  space,
  children,
  mapping,
}: { space: string; children: ReactNode; mapping?: Mapping }) {
  const repo = useRepo();
  const ref = useRef<HypergraphContext | undefined>(undefined);

  let current = ref.current;
  if (current === undefined || space !== current.space || repo !== current.repo) {
    const id = Utils.idToAutomergeId(space) as AnyDocumentId;
    const handle = repo.find<Entity.DocumentContent>(id);

    current = ref.current = {
      space,
      repo,
      id,
      handle,
      mapping,
    };
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HypergraphReactContext.Provider value={current}>{children}</HypergraphReactContext.Provider>
    </QueryClientProvider>
  );
}

export function useCreateEntity<const S extends Entity.AnyNoContext>(type: S) {
  const hypergraph = useHypergraph();
  return Entity.create(hypergraph.handle, type);
}

export function useUpdateEntity<const S extends Entity.AnyNoContext>(type: S) {
  const hypergraph = useHypergraph();
  return Entity.update(hypergraph.handle, type);
}

export function useDeleteEntity() {
  const hypergraph = useHypergraph();
  return Entity.markAsDeleted(hypergraph.handle);
}

export function useHardDeleteEntity() {
  const hypergraph = useHypergraph();
  return Entity.delete(hypergraph.handle);
}

type QueryParams = {
  enabled: boolean;
};

export function useQueryLocal<const S extends Entity.AnyNoContext>(type: S, params?: QueryParams) {
  const { enabled = true } = params ?? {};
  const stableArrayRef = useRef<Entity.Entity<S>[]>([]);

  const hypergraph = useHypergraph();
  const [subscription] = useState(() => {
    if (!enabled) {
      return {
        subscribe: () => () => undefined,
        getEntities: () => stableArrayRef.current,
      };
    }

    return Entity.subscribeToFindMany(hypergraph.handle, type);
  });

  // TODO: allow to change the enabled state

  return useSyncExternalStore(subscription.subscribe, subscription.getEntities, () => stableArrayRef.current);
}

export function useQueryEntity<const S extends Entity.AnyNoContext>(type: S, id: string) {
  const hypergraph = useHypergraph();
  const prevEntityRef = useRef<Entity.Entity<S> | undefined>(undefined);
  const equals = Schema.equivalence(type);

  const subscribe = (callback: () => void) => {
    const handleChange = () => {
      callback();
    };

    const handleDelete = () => {
      callback();
    };

    hypergraph.handle.on('change', handleChange);
    hypergraph.handle.on('delete', handleDelete);

    return () => {
      hypergraph.handle.off('change', handleChange);
      hypergraph.handle.off('delete', handleDelete);
    };
  };

  return useSyncExternalStore(subscribe, () => {
    const doc = hypergraph.handle.docSync();
    if (doc === undefined) {
      return prevEntityRef.current;
    }

    const found = Entity.findOne(hypergraph.handle, type)(id);
    if (found === undefined && prevEntityRef.current !== undefined) {
      // entity was maybe deleted, delete from the ref
      prevEntityRef.current = undefined;
    } else if (found !== undefined && prevEntityRef.current === undefined) {
      prevEntityRef.current = found;
    } else if (found !== undefined && prevEntityRef.current !== undefined && !equals(found, prevEntityRef.current)) {
      // found and ref have a value, compare for equality, if they are not equal, update the ref and return
      prevEntityRef.current = found;
    }

    return prevEntityRef.current;
  });
}

export const useHypergraphSpace = () => {
  const { space } = useHypergraph();
  return space;
};
