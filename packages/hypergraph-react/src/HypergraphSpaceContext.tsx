'use client';

import type { AnyDocumentId } from '@automerge/automerge-repo';
import { useRepo } from '@automerge/automerge-repo-react-hooks';
import { type ReactNode, createContext, useContext, useRef, useSyncExternalStore } from 'react';

import { Schema, Utils } from '@graphprotocol/hypergraph';

//#region HypergraphSpaceContext

export type HypergraphSpaceCtx = {
  defaultSpaceId: string;
  defaultAutomergeDocId: string;
  spaces: Readonly<Array<string>>;
};

export const HypergraphSpaceContext = createContext<HypergraphSpaceCtx | null>(null);

export function useHypergraphSpace() {
  const context = useContext(HypergraphSpaceContext);
  if (!context) {
    throw new Error('useHypergraphSpace must be used within a HypergraphSpaceProvider');
  }

  return context as HypergraphSpaceCtx;
}

export function useHypergraphDefaultSpaceId() {
  const context = useHypergraphSpace();
  return context.defaultSpaceId;
}

export function useHypergraphSpaces() {
  const context = useHypergraphSpace();
  return context.spaces ?? [];
}

export function useHypergraphDefaultAutomergeDocId() {
  const context = useHypergraphSpace();
  return context.defaultAutomergeDocId;
}

export type HypergraphSpaceProviderProps = Readonly<{
  defaultSpaceId: HypergraphSpaceCtx['defaultSpaceId'];
  spaces?: HypergraphSpaceCtx['spaces'];
  children: ReactNode;
}>;
export function HypergraphSpaceProvider(props: HypergraphSpaceProviderProps) {
  return (
    <HypergraphSpaceContext.Provider
      value={{
        defaultSpaceId: props.defaultSpaceId,
        defaultAutomergeDocId: Utils.idToAutomergeId(props.defaultSpaceId),
        spaces: props.spaces ?? [],
      }}
    >
      {props.children}
    </HypergraphSpaceContext.Provider>
  );
}

//#endregion

//#region react hook wrappers

export function useCreateEntity<const S extends Schema.AnyNoContext>(type: S) {
  const repo = useRepo();
  const automergeDocId = useHypergraphDefaultAutomergeDocId();

  function createEntity(data: Schema.CreateEntityArgs<S>): Schema.Entity<S> {
    return Schema.createEntity<S>(repo, automergeDocId, type, data);
  }

  return createEntity;
}

export function useUpdateEntity<const S extends Schema.AnyNoContext>(type: S) {
  const repo = useRepo();
  const automergeDocId = useHypergraphDefaultAutomergeDocId();

  function updateEntity(data: Schema.UpdateEntityArgs<S>): Schema.Entity<S> {
    return Schema.updateEntity<S>(repo, automergeDocId, type, data);
  }

  return updateEntity;
}

export function useDeleteEntity() {
  const repo = useRepo();
  const automergeDocId = useHypergraphDefaultAutomergeDocId();

  function deleteEntity(id: string): boolean {
    return Schema.deleteEntity(repo, automergeDocId, id);
  }

  return deleteEntity;
}

export function useQueryEntities<const S extends Schema.AnyNoContext>(type: S) {
  const repo = useRepo();
  const automergeDocId = useHypergraphDefaultAutomergeDocId();

  const handle = repo.find<Schema.DocumentContent>(automergeDocId as AnyDocumentId);

  const equal = isEqual(type);

  // store as a map of type to array of entities of the type
  const prevEntitiesRef = useRef<Readonly<Array<Schema.Entity<S>>>>([]);

  const subscribe = (callback: () => void) => {
    const handleChange = () => {
      callback();
    };

    const handleDelete = () => {
      callback();
    };

    handle?.on('change', handleChange);
    handle?.on('delete', handleDelete);

    return () => {
      handle?.off('change', handleChange);
      handle?.off('delete', handleDelete);
    };
  };

  return useSyncExternalStore<Readonly<Array<Schema.Entity<S>>>>(subscribe, () => {
    const doc = handle?.docSync();
    if (doc === undefined) {
      return prevEntitiesRef.current;
    }

    const filtered = Schema.findMany<S>(repo, automergeDocId, type);

    if (!equal(filtered, prevEntitiesRef.current)) {
      prevEntitiesRef.current = filtered;
    }

    return prevEntitiesRef.current;
  });
}

export function useQueryEntity<const S extends Schema.AnyNoContext>(type: S, id: string) {
  const repo = useRepo();
  const automergeDocId = useHypergraphDefaultAutomergeDocId();

  const handle = repo.find<Schema.DocumentContent>(automergeDocId as AnyDocumentId);

  const prevEntityRef = useRef<Schema.Entity<S> | null>(null);

  const equals = Schema.equivalence(type);

  const subscribe = (callback: () => void) => {
    const handleChange = () => {
      callback();
    };

    const handleDelete = () => {
      callback();
    };

    handle?.on('change', handleChange);
    handle?.on('delete', handleDelete);

    return () => {
      handle?.off('change', handleChange);
      handle?.off('delete', handleDelete);
    };
  };

  return useSyncExternalStore(subscribe, () => {
    const doc = handle?.docSync();
    if (doc === undefined) {
      return prevEntityRef.current;
    }

    const found = Schema.findOne(repo, automergeDocId, type, id);

    if (found == null && prevEntityRef.current != null) {
      // entity was maybe deleted, delete from the ref
      prevEntityRef.current = null;
    } else if (found != null && prevEntityRef.current == null) {
      prevEntityRef.current = found;
    } else if (found != null && prevEntityRef.current != null && !equals(found, prevEntityRef.current)) {
      // found and ref have a value, compare for equality, if they are not equal, update the ref and return
      prevEntityRef.current = found;
    }

    return prevEntityRef.current;
  });
}

//#endregion

/** @internal */
function isEqual<A, E>(type: Schema.EffectSchema<A, E>) {
  const equals = Schema.equivalence(type);

  return (a: Readonly<Array<A>>, b: Readonly<Array<A>>) => {
    if (a.length !== b.length) {
      return false;
    }

    // @ts-expect-error id is defined
    const bMap = new Map(b.map((item) => [item.id, item]));

    // using .every exits at the first mismatch
    return a.every((itemA) => {
      // @ts-expect-error id is defined
      const itemB = bMap.get(itemA.id);
      return itemB !== undefined && equals(itemA, itemB);
    });
  };
}
