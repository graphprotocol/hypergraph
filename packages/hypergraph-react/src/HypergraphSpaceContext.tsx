'use client';

import type { AnyDocumentId, DocHandle, Repo } from '@automerge/automerge-repo';
import { useRepo } from '@automerge/automerge-repo-react-hooks';
import { Entity, Utils } from '@graphprotocol/hypergraph';
import * as Schema from 'effect/Schema';
import { type ReactNode, createContext, useContext, useRef, useSyncExternalStore } from 'react';

export type HypergraphContext = {
  space: string;
  repo: Repo;
  id: AnyDocumentId;
  handle: DocHandle<Entity.DocumentContent>;
};

export const HypergraphReactContext = createContext<HypergraphContext | undefined>(undefined);

export function useHypergraph() {
  const context = useContext(HypergraphReactContext);
  if (!context) {
    throw new Error('useHypergraphSpace must be used within a HypergraphSpaceProvider');
  }

  return context as HypergraphContext;
}

export function HypergraphSpaceProvider({ space, children }: { space: string; children: ReactNode }) {
  const repo = useRepo();
  const ref = useRef<HypergraphContext | undefined>(undefined);

  let current = ref.current;
  if (current === undefined || space !== current.space || repo !== current.repo) {
    const id = Utils.idToAutomergeId(space) as AnyDocumentId;
    current = ref.current = {
      space,
      repo,
      id,
      handle: repo.find(id),
    };
  }

  return <HypergraphReactContext.Provider value={current}>{children}</HypergraphReactContext.Provider>;
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
  return Entity.delete(hypergraph.handle);
}

export function useQueryEntities<const S extends Entity.AnyNoContext>(type: S) {
  const hypergraph = useHypergraph();
  const equal = isEqual(type);

  // store as a map of type to array of entities of the type
  const prevEntitiesRef = useRef<Readonly<Array<Entity.Entity<S>>>>([]);

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

  return useSyncExternalStore<Readonly<Array<Entity.Entity<S>>>>(subscribe, () => {
    const filtered = Entity.findMany(hypergraph.handle, type);
    if (!equal(filtered, prevEntitiesRef.current)) {
      prevEntitiesRef.current = filtered;
    }

    return prevEntitiesRef.current;
  });
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

/** @internal */
const isEqual = <A, E>(type: Schema.Schema<A, E, never>) => {
  const equals = Schema.equivalence(type);

  return (a: ReadonlyArray<A>, b: ReadonlyArray<A>) => {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }

    return true;
  };
};
