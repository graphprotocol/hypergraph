import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { useDocument, useRepo } from '@automerge/automerge-repo-react-hooks';
import type * as Model from '@effect/sql/Model';
import { generateId, idToAutomergeId } from '@graph-framework/utils';
import * as Schema from 'effect/Schema';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useRef, useSyncExternalStore } from 'react';

interface SpacesProviderProps {
  children: ReactNode;
  defaultSpace: string;
  spaces?: string[];
}

type SpaceContextProps = {
  defaultSpace: string;
  defaultAutomergeDocId: string;
  spaces: string[];
};

const SpaceContext = createContext<SpaceContextProps | undefined>(undefined);

export function SpacesProvider({ children, defaultSpace, spaces }: SpacesProviderProps) {
  const contextValue: SpaceContextProps = {
    defaultSpace,
    defaultAutomergeDocId: idToAutomergeId(defaultSpace),
    spaces: spaces ?? [],
  };

  return <SpaceContext.Provider value={contextValue}>{children}</SpaceContext.Provider>;
}

export const useDefaultSpaceId = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('This hook must be used within a SpacesProvider');
  }
  return context.defaultSpace;
};

type DocumentContent = {
  entities?: Record<string, unknown>;
};

const useDefaultAutomergeDocId = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('This hook must be used within a SpacesProvider');
  }
  return context.defaultAutomergeDocId;
};

export const useCreateEntity = <S extends Model.AnyNoContext>(type: S) => {
  const id = useDefaultAutomergeDocId();
  const [, changeDoc] = useDocument<DocumentContent>(id as AnyDocumentId);
  const encode = Schema.encodeSync(type.insert);

  function createEntity(data: Schema.Schema.Type<S['insert']>): string {
    const entityId = generateId();
    changeDoc((doc) => {
      doc.entities ??= {};
      doc.entities[entityId] = encode(data);
    });

    return entityId;
  }

  return createEntity;
};

export const useUpdateEntity = <S extends Model.AnyNoContext>(type: S) => {
  const id = useDefaultAutomergeDocId();
  const [, changeDoc] = useDocument<DocumentContent>(id as AnyDocumentId);
  const encode = Schema.encodeSync(Schema.partial(type.update));

  function updateEntity(
    entityId: string,
    data: Schema.Simplify<Partial<Omit<Schema.Schema.Type<S['update']>, 'id'>>>,
  ): boolean {
    let success = false;
    changeDoc((doc) => {
      const existingEntity = doc.entities?.[entityId];
      if (existingEntity === undefined) {
        return;
      }

      const updatedData = encode({ ...existingEntity, ...data });
      // @ts-expect-error doc.entities was checked above
      doc.entities[entityId] = updatedData;
      success = true;
    });

    return success;
  }

  return updateEntity;
};

export const useDeleteEntity = () => {
  const id = useDefaultAutomergeDocId();

  // can't use useDocument here because it would trigger a re-render every time the document changes
  const repo = useRepo();
  const handle = repo.find<DocumentContent>(id as AnyDocumentId);
  const handleRef = useRef<DocHandle<DocumentContent>>(handle);
  if (handle !== handleRef.current) {
    handleRef.current = handle;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const deleteEntity = useCallback(
    function deleteEntity(entityId: string): boolean {
      let result = false;
      handle.change((doc) => {
        if (doc.entities?.[entityId] !== undefined) {
          delete doc.entities[entityId];
          result = true;
        }
      });

      return result;
    },
    [id],
  );

  return deleteEntity;
};

export const useQuery = <S extends Model.AnyNoContext>(type: S) => {
  const prevEntitiesRef = useRef<Array<Schema.Schema.Type<S>>>([]);
  const id = useDefaultAutomergeDocId();
  const repo = useRepo();
  const equal = isEqual(type);
  const decode = Schema.decodeUnknownSync(type);
  const handle = repo.find<DocumentContent>(id as AnyDocumentId);

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

  const entities = useSyncExternalStore(subscribe, () => {
    const doc = handle?.docSync();
    if (doc === undefined) {
      return prevEntitiesRef.current;
    }

    const filtered: Array<Schema.Schema.Type<S>> = [];
    for (const entityId in doc.entities) {
      const entity = doc.entities[entityId];
      if (typeof entity === 'object') {
        filtered.push(decode({ ...entity, id: entityId }));
      }
    }

    if (!equal(filtered, prevEntitiesRef.current)) {
      prevEntitiesRef.current = filtered;
    }

    return prevEntitiesRef.current;
  });

  return entities;
};

const isEqual = <A, E>(type: Schema.Schema<A, E, never>) => {
  const equals = Schema.equivalence(type);

  return (a: Array<A>, b: Array<A>) => {
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
