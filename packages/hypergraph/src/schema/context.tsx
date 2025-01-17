import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { useDocument, useRepo } from '@automerge/automerge-repo-react-hooks';
import { Utils } from '@graphprotocol/hypergraph';
import * as Schema from 'effect/Schema';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import { generateId, idToAutomergeId } from '../utils/index.js';
import type * as Model from './model.js';

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

  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;

  function createEntity(data: Schema.Schema.Type<Model.Insert<S>>): string {
    const entityId = generateId();
    changeDoc((doc) => {
      doc.entities ??= {};
      doc.entities[entityId] = { ...encode(data), '@@types@@': [typeName] };
    });

    return entityId;
  }

  return createEntity;
};

export const useUpdateEntity = <S extends Model.AnyNoContext>(type: S) => {
  const docId = useDefaultAutomergeDocId();
  const [, changeDoc] = useDocument<DocumentContent>(docId as AnyDocumentId);
  const encode = Schema.encodeSync(Schema.partial(type.update));

  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;

  function updateEntity(id: string, data: Schema.Simplify<Partial<Schema.Schema.Type<Model.Update<S>>>>): boolean {
    let success = false;
    changeDoc((doc) => {
      const existingEntity = doc.entities?.[id];
      if (existingEntity === undefined) {
        return;
      }

      const updatedData = encode({ ...existingEntity, ...data });
      // @ts-expect-error doc.entities was checked above
      doc.entities[id] = { ...updatedData, '@@types@@': [typeName] };
      success = true;
    });

    return success;
  }

  return updateEntity;
};

export const useDeleteEntity = () => {
  const docId = useDefaultAutomergeDocId();
  // can't use useDocument here because it would trigger a re-render every time the document changes
  const repo = useRepo();
  const handle = repo.find<DocumentContent>(docId as AnyDocumentId);
  const handleRef = useRef<DocHandle<DocumentContent>>(handle);
  if (handle !== handleRef.current) {
    handleRef.current = handle;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const deleteEntity = useCallback(
    (id: string): boolean => {
      let result = false;
      handle.change((doc) => {
        if (doc.entities?.[id] !== undefined) {
          delete doc.entities[id];
          result = true;
        }
      });

      return result;
    },
    [docId],
  );

  return deleteEntity;
};

export const useQuery = <S extends Model.AnyNoContext>(type: S) => {
  const prevEntitiesRef = useRef<Array<Schema.Schema.Type<S>>>([]);
  const docId = useDefaultAutomergeDocId();
  const repo = useRepo();
  const equal = isEqual(type);
  const decode = Schema.decodeUnknownSync(type);
  const handle = repo.find<DocumentContent>(docId as AnyDocumentId);

  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;

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

    // TODO: Instead of this insane filtering logic, we should be keeping track of the entities in
    // an index and store the decoded valeus instead of re-decoding over and over again.
    const filtered: Array<Schema.Schema.Type<S>> = [];
    for (const id in doc.entities) {
      const entity = doc.entities[id];
      if (
        typeof entity === 'object' &&
        entity !== null &&
        '@@types@@' in entity &&
        Array.isArray(entity['@@types@@']) &&
        entity['@@types@@'].includes(typeName)
      ) {
        filtered.push(decode({ ...entity, id: id }));
      }
    }

    if (!equal(filtered, prevEntitiesRef.current)) {
      prevEntitiesRef.current = filtered;
    }

    return prevEntitiesRef.current;
  });

  return entities;
};

export const useChanges = () => {
  const docId = useDefaultAutomergeDocId();
  // can't use useDocument here because it would trigger a re-render every time the document changes
  const repo = useRepo();
  const handle = repo.find<DocumentContent>(docId as AnyDocumentId);
  const handleRef = useRef<DocHandle<DocumentContent>>(handle);
  if (handle !== handleRef.current) {
    handleRef.current = handle;
  }

  // biome-ignore lint/suspicious/noExplicitAny: todo
  const data = useRef<{ [key: string]: any }>({});

  console.log('data', data.current);

  useEffect(() => {
    if (handle) {
      const doc = handle.docSync();
      data.current = JSON.parse(JSON.stringify(doc));

      handle.on('change', ({ patches }) => {
        for (const patch of patches) {
          console.log('patch', patch);
          switch (patch.action) {
            case 'put': {
              let reference = data.current;
              for (const key of patch.path.slice(0, -1)) {
                if (reference[key] === undefined) {
                  reference[key] = {};
                }
                reference = reference[key];
              }
              reference[patch.path[patch.path.length - 1]] = patch.value;
              break;
            }
            case 'del': {
              let reference = data.current;
              for (const key of patch.path.slice(0, -1)) {
                reference = reference[key];
              }
              console.log('del', reference);
              delete reference[patch.path[patch.path.length - 1]];
              break;
            }
            case 'insert': {
              let reference = data.current;
              for (const key of patch.path.slice(0, -1)) {
                reference = reference[key];
              }
              reference[patch.path[patch.path.length - 1]] = patch.values;
              break;
            }
            // only seen for strings and therefor only handling this case so far
            case 'splice': {
              let reference = data.current;
              for (const key of patch.path.slice(0, -2)) {
                reference = reference[key];
              }

              const currentString = reference[patch.path[patch.path.length - 2]] as string;
              const index = patch.path[patch.path.length - 2] as number;
              const newString =
                currentString.slice(0, index) + patch.value + currentString.slice(index + patch.value.length);
              reference[patch.path[patch.path.length - 1]] = newString;
              break;
            }
            case 'inc': {
              let reference = data.current;
              for (const key of patch.path.slice(0, -1)) {
                reference = reference[key];
              }
              reference[patch.path[patch.path.length - 1]] += patch.value;
              break;
            }
            // can be ignored since it's no value change and only used for info that there is a conflict

            case 'conflict':
              break;
            // can be ignored until we use the native automerge Text type
            case 'unmark':
              break;
            case 'mark':
              break;

            default:
              Utils.assertExhaustive(patch);
              break;
          }
        }

        console.log('data', data.current);
      });
    }
  }, [handle]);
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
