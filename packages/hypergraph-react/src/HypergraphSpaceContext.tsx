'use client';

import type { AnyDocumentId, DocHandle, Repo } from '@automerge/automerge-repo';
import { useRepo } from '@automerge/automerge-repo-react-hooks';
import { Entity, Utils } from '@graphprotocol/hypergraph';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Schema from 'effect/Schema';
import { type ReactNode, createContext, useContext, useMemo, useRef, useState, useSyncExternalStore } from 'react';

export type HypergraphContext = {
  space: string;
  repo: Repo;
  id: AnyDocumentId;
  handle: DocHandle<Entity.DocumentContent>;
};

export const HypergraphReactContext = createContext<HypergraphContext | undefined>(undefined);

function useHypergraphSpaceInternal() {
  const context = useContext(HypergraphReactContext);
  if (!context) {
    throw new Error('useHypergraphSpace must be used within a HypergraphSpaceProvider');
  }

  return context as HypergraphContext;
}

const queryClient = new QueryClient();

export function HypergraphSpaceProvider({ space, children }: { space: string; children: ReactNode }) {
  const repo = useRepo();
  const ref = useRef<HypergraphContext | undefined>(undefined);

  let current = ref.current;
  if (current === undefined || space !== current.space || repo !== current.repo) {
    const id = Utils.idToAutomergeId(space) as AnyDocumentId;
    const result = repo.findWithProgress<Entity.DocumentContent>(id);

    current = ref.current = {
      space,
      repo,
      id,
      handle: result.handle,
    };
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HypergraphReactContext.Provider value={current}>{children}</HypergraphReactContext.Provider>
    </QueryClientProvider>
  );
}

export function useCreateEntity<const S extends Entity.AnyNoContext>(type: S) {
  const hypergraph = useHypergraphSpaceInternal();
  return Entity.create(hypergraph.handle, type);
}

export function useUpdateEntity<const S extends Entity.AnyNoContext>(type: S) {
  const hypergraph = useHypergraphSpaceInternal();
  return Entity.update(hypergraph.handle, type);
}

export function useDeleteEntity() {
  const hypergraph = useHypergraphSpaceInternal();
  return Entity.markAsDeleted(hypergraph.handle);
}

export function useRemoveRelation() {
  const hypergraph = useHypergraphSpaceInternal();
  return Entity.removeRelation(hypergraph.handle);
}

export function useHardDeleteEntity() {
  const hypergraph = useHypergraphSpaceInternal();
  return Entity.delete(hypergraph.handle);
}

type QueryParams<S extends Entity.AnyNoContext> = {
  enabled: boolean;
  filter?: { [K in keyof Schema.Schema.Type<S>]?: Entity.EntityFieldFilter<Schema.Schema.Type<S>[K]> } | undefined;
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, never> } | undefined;
};

export function useQueryLocal<const S extends Entity.AnyNoContext>(type: S, params?: QueryParams<S>) {
  const { enabled = true, filter, include } = params ?? {};
  const entitiesRef = useRef<Entity.Entity<S>[]>([]);

  const hypergraph = useHypergraphSpaceInternal();
  const [subscription] = useState(() => {
    if (!enabled) {
      return {
        subscribe: () => () => undefined,
        getEntities: () => entitiesRef.current,
      };
    }

    return Entity.subscribeToFindMany(hypergraph.handle, type, filter, include);
  });

  // TODO: allow to change the enabled state

  const allEntities = useSyncExternalStore(subscription.subscribe, subscription.getEntities, () => entitiesRef.current);

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

export function useQueryEntity<const S extends Entity.AnyNoContext>(
  type: S,
  id: string,
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, never> },
) {
  const hypergraph = useHypergraphSpaceInternal();
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
    const doc = hypergraph.handle.doc();
    if (doc === undefined) {
      return prevEntityRef.current;
    }

    const found = Entity.findOne(hypergraph.handle, type, include)(id);
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
  const { space } = useHypergraphSpaceInternal();
  return space;
};
