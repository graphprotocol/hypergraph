import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { useDocument, useRepo } from '@automerge/automerge-repo-react-hooks';
import { generateId, idToAutomergeId } from '@graph-framework/utils';
import * as S from 'effect/Schema';
import fastDeepEqual from 'fast-deep-equal';
import { type ReactNode, createContext, useCallback, useContext, useRef, useSyncExternalStore } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: typedefs are unknown and determined by the schema. todo: figure out a way to make generic?
type SchemaTypeUnknown = any;

interface SpacesProviderProps {
  children: ReactNode;
  defaultSpace: string;
  spaces?: string[];
}

type DocumentContent = {
  entities: Record<string, SchemaTypeUnknown>;
};

export const type = {
  Text: S.String,
  Number: S.Number,
  Checkbox: S.Boolean,
  Relation: (config: { key: string; type: string }) => ({
    _tag: 'Relation' as const,
    key: config.key,
    type: config.type,
  }),
};

type BaseEntity = {
  id: string;
  types: string[];
};

// Helper type to extract schema type
type SchemaType<T> = T extends S.Schema<SchemaTypeUnknown, infer A> ? A : never;

// Add a type for Relations
type RelationType = {
  _tag: 'Relation';
  key: string;
  type: string;
};

// Update SchemaDefinition to accept both Schema and RelationType
export type SchemaDefinition = Record<
  string,
  Record<string, S.Schema<SchemaTypeUnknown, SchemaTypeUnknown> | RelationType>
>;

// Extract all possible keys from schema types
type EntityKeys<T extends SchemaDefinition> = keyof T & string;

// Get merged type from array of keys
type MergedEntityType<
  T extends SchemaDefinition,
  Keys extends readonly EntityKeys<T>[],
  Additional,
> = UnionToIntersection<
  {
    [K in Keys[number]]: {
      [P in keyof T[K]]: SchemaType<T[K][P]>;
    };
  }[Keys[number]]
> &
  Additional;

// Helper type to convert union to intersection
type UnionToIntersection<U> = (U extends SchemaTypeUnknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

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
  return context?.defaultSpace;
};

const useDefaultAutomergeDocId = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('This hook must be used within a SpacesProvider');
  }
  return context?.defaultAutomergeDocId;
};

export function createSchemaHooks<T extends SchemaDefinition>(schema: T) {
  function buildMergedSchema<K extends readonly EntityKeys<T>[]>(
    types: [...K],
    // biome-ignore lint/complexity/noBannedTypes: empty object is fine
  ): S.Schema<SchemaTypeUnknown, MergedEntityType<T, K, {}>> {
    const propertySchemas = types.reduce(
      (acc, type) => {
        const typeSchema = schema[type];

        for (const [key, prop] of Object.entries(typeSchema)) {
          // Check if the property is a relation
          if (typeof prop === 'object' && '_tag' in prop && prop._tag === 'Relation') {
            // For relations, we'll use a string array schema
            acc[key] = S.Array(S.String) as S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>;
          } else {
            acc[key] = prop as S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>;
          }
        }

        return acc;
      },
      {} as Record<string, S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>>,
    );

    // biome-ignore lint/complexity/noBannedTypes: empty object is fine
    return S.Struct(propertySchemas) as unknown as S.Schema<SchemaTypeUnknown, MergedEntityType<T, K, {}>>;
  }

  function useCreateEntity() {
    const id = useDefaultAutomergeDocId();
    const [, changeDoc] = useDocument<DocumentContent>(id as AnyDocumentId);

    function createEntity<K extends readonly EntityKeys<T>[]>({
      types,
      data,
    }: {
      types: [...K];
      // biome-ignore lint/complexity/noBannedTypes: empty object is fine
      data: MergedEntityType<T, K, {}>;
      // biome-ignore lint/complexity/noBannedTypes: empty object is fine
    }): MergedEntityType<T, K, {}> {
      if (types.length === 0) {
        throw new Error('Entity must have at least one type');
      }

      const mergedSchema = buildMergedSchema(types);
      const result = S.decodeUnknownSync(mergedSchema)(data);

      changeDoc((doc) => {
        if (!doc.entities) {
          doc.entities = {};
        }
        // Add the main entity
        const entityId = generateId();
        doc.entities[entityId] = { ...result, types };
      });

      return result as MergedEntityType<T, K, BaseEntity>;
    }

    return createEntity;
  }

  function useDeleteEntity() {
    const id = useDefaultAutomergeDocId();

    // can't use useDocument here because it would trigger a re-render every time the document changes
    const repo = useRepo();
    const handle = id ? repo.find<DocumentContent>(id as AnyDocumentId) : null;
    const handleRef = useRef<DocHandle<DocumentContent> | null>(handle);
    if (handle !== handleRef.current) {
      handleRef.current = handle;
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    const deleteEntity = useCallback(
      function deleteEntity(entityId: string) {
        let result = false;
        if (!handle) return result;
        handle.change((doc) => {
          if (doc.entities) {
            if (doc.entities[entityId]) {
              delete doc.entities[entityId];
              result = true;
            }
          }
        });

        return result;
      },
      [id],
    );

    return deleteEntity;
  }

  function useQuery<K extends readonly EntityKeys<T>[]>({
    types,
  }: {
    types: [...K];
  }) {
    const prevEntitiesRef = useRef<MergedEntityType<T, K, BaseEntity>[]>([]);
    const id = useDefaultAutomergeDocId();
    const repo = useRepo();

    const handle = id
      ? repo.find<DocumentContent>(id as AnyDocumentId)
      : repo.create<DocumentContent>({ entities: {} });

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

    const entities = useSyncExternalStore(subscribe, (): MergedEntityType<T, K, BaseEntity>[] => {
      const doc = handle?.docSync();
      if (!doc) {
        if (fastDeepEqual(prevEntitiesRef.current, [])) {
          return prevEntitiesRef.current;
          // biome-ignore lint/style/noUselessElse: <explanation>
        } else {
          prevEntitiesRef.current = [];
          return prevEntitiesRef.current;
        }
      }

      // Create filteredEntities object with only entities that include all the types and attach the entity id
      const filteredEntities: Record<string, MergedEntityType<T, K, BaseEntity>> = {};
      for (const entityId in doc.entities) {
        const entity = doc.entities[entityId];
        if (types.every((type) => entity.types?.includes(type as string))) {
          filteredEntities[entityId] = { ...entity, id: entityId } as MergedEntityType<T, K, BaseEntity>;
        }
      }

      const filteredEntitiesArray = Object.values(filteredEntities);

      if (fastDeepEqual(prevEntitiesRef.current, filteredEntitiesArray)) {
        return prevEntitiesRef.current;
        // biome-ignore lint/style/noUselessElse: <explanation>
      } else {
        prevEntitiesRef.current = filteredEntitiesArray;
        return prevEntitiesRef.current;
      }
    });

    return entities;
  }

  function useUpdateEntity() {
    const id = useDefaultAutomergeDocId();
    const [, changeDoc] = useDocument<DocumentContent>(id as AnyDocumentId);

    function updateEntity<K extends readonly EntityKeys<T>[]>({
      id: entityId,
      types,
      data: updates,
    }: {
      id: string;
      types: [...K];
      // biome-ignore lint/complexity/noBannedTypes: in this case an empty object is fine
      data: Partial<MergedEntityType<T, K, {}>>;
    }): boolean {
      if (types.length === 0) {
        throw new Error('Entity must have at least one type');
      }

      const mergedSchema = buildMergedSchema(types);

      let success = false;

      changeDoc((doc) => {
        if (!doc.entities || !doc.entities[entityId]) {
          return;
        }

        const existingEntity = doc.entities[entityId];
        // verify that the entity has all the required types
        if (!types.every((type) => existingEntity.types.includes(type))) {
          return;
        }

        // Merge updates with existing entity data to validate it against the schema
        const updatedData = {
          ...existingEntity,
          ...updates,
          types: existingEntity.types, // Preserve types
        };

        try {
          S.decodeUnknownSync(mergedSchema)(updatedData);
          for (const key in updates) {
            doc.entities[entityId][key] = updates[key];
          }
          success = true;
        } catch (error) {
          console.error('Schema validation failed:', error);
        }
      });

      return success;
    }

    return updateEntity;
  }

  return {
    useCreateEntity,
    useDeleteEntity,
    useUpdateEntity,
    useQuery,
  };
}
