'use client';

import type { AnyDocumentId } from '@automerge/automerge-repo';
import { useRepo } from '@automerge/automerge-repo-react-hooks';
import { Entity, Utils } from '@graphprotocol/hypergraph';
import * as Schema from 'effect/Schema';
import { type ReactNode, createContext, useContext, useMemo, useRef, useState, useSyncExternalStore } from 'react';

export type HypergraphContext = { space: string };

export const HypergraphReactContext = createContext<HypergraphContext | undefined>(undefined);

function useHypergraphSpaceInternal() {
  const context = useContext(HypergraphReactContext);
  if (!context) {
    throw new Error('useHypergraphSpace must be used within a HypergraphSpaceProvider');
  }

  return context as HypergraphContext;
}

export function HypergraphSpaceProvider({ space, children }: { space: string; children: ReactNode }) {
  return <HypergraphReactContext.Provider value={{ space }}>{children}</HypergraphReactContext.Provider>;
}

function useAutomergeHandle({ spaceId }: { spaceId: string }) {
  const repo = useRepo();
  const handle = useMemo(() => {
    const id = Utils.idToAutomergeId(spaceId) as AnyDocumentId;
    const result = repo.findWithProgress<Entity.DocumentContent>(id);
    return result.handle;
  }, [spaceId, repo]);

  return handle;
}

export function useCreateEntity<const S extends Entity.AnyNoContext>(type: S) {
  const { space } = useHypergraphSpaceInternal();
  const handle = useAutomergeHandle({ spaceId: space });
  return Entity.create(handle, type);
}

export function useUpdateEntity<const S extends Entity.AnyNoContext>(type: S) {
  const { space } = useHypergraphSpaceInternal();
  const handle = useAutomergeHandle({ spaceId: space });
  return Entity.update(handle, type);
}

export function useDeleteEntity() {
  const { space } = useHypergraphSpaceInternal();
  const handle = useAutomergeHandle({ spaceId: space });
  return Entity.markAsDeleted(handle);
}

export function useRemoveRelation() {
  const { space } = useHypergraphSpaceInternal();
  const handle = useAutomergeHandle({ spaceId: space });
  return Entity.removeRelation(handle);
}

export function useHardDeleteEntity() {
  const { space } = useHypergraphSpaceInternal();
  const handle = useAutomergeHandle({ spaceId: space });
  return Entity.delete(handle);
}

type QueryParams<S extends Entity.AnyNoContext> = {
  enabled: boolean;
  filter?: { [K in keyof Schema.Schema.Type<S>]?: Entity.EntityFieldFilter<Schema.Schema.Type<S>[K]> } | undefined;
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
};

export function useQueryLocal<const S extends Entity.AnyNoContext>(type: S, params?: QueryParams<S>) {
  const { enabled = true, filter, include } = params ?? {};
  const entitiesRef = useRef<Entity.Entity<S>[]>([]);
  const { space } = useHypergraphSpaceInternal();
  const handle = useAutomergeHandle({ spaceId: space });

  const [subscription] = useState(() => {
    if (!enabled) {
      return {
        subscribe: () => () => undefined,
        getEntities: () => entitiesRef.current,
      };
    }

    return Entity.subscribeToFindMany(handle, type, filter, include);
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
  const { space } = useHypergraphSpaceInternal();
  const handle = useAutomergeHandle({ spaceId: space });
  const prevEntityRef = useRef<Entity.Entity<S> | undefined>(undefined);
  const equals = Schema.equivalence(type);

  const subscribe = (callback: () => void) => {
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
    const doc = handle.doc();
    if (doc === undefined) {
      return prevEntityRef.current;
    }

    const found = Entity.findOne(handle, type, include)(id);
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
