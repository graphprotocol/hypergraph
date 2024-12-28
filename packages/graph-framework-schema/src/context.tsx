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
};

type BaseEntity = {
  id: string;
  types: string[];
};

// Helper type to extract schema type
type SchemaType<T> = T extends S.Schema<SchemaTypeUnknown, infer A> ? A : never;

// Type for the schema structure
export type SchemaDefinition = {
  types: Record<string, Record<string, S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>>>;
};

// Extract all possible keys from schema types
type EntityKeys<T extends SchemaDefinition> = keyof T['types'] & string;

// Get merged type from array of keys
type MergedEntityType<
  T extends SchemaDefinition,
  Keys extends readonly EntityKeys<T>[],
  Additional,
> = UnionToIntersection<
  {
    [K in Keys[number]]: {
      [P in keyof T['types'][K]]: SchemaType<T['types'][K][P]>;
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
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
  ): S.Schema<SchemaTypeUnknown, MergedEntityType<T, K, {}>> {
    // Create a record of all properties and their schemas
    const propertySchemas = types.reduce(
      (acc, type) => {
        const typeSchema = schema.types[type];

        for (const [key, prop] of Object.entries(typeSchema)) {
          // Regular property
          acc[key] = prop as S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>;
        }

        return acc;
      },
      {} as Record<string, S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>>,
    );

    // Convert the record to a struct schema
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    return S.Struct(propertySchemas) as unknown as S.Schema<SchemaTypeUnknown, MergedEntityType<T, K, {}>>;
  }

  function useCreateEntity() {
    const id = useDefaultAutomergeDocId();
    const [, changeDoc] = useDocument<DocumentContent>(id as AnyDocumentId);

    function createEntity<K extends readonly EntityKeys<T>[]>(
      types: [...K],
      // biome-ignore lint/complexity/noBannedTypes: <explanation>
      data: MergedEntityType<T, K, {}>,
      // biome-ignore lint/complexity/noBannedTypes: <explanation>
    ): MergedEntityType<T, K, {}> {
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

    function updateEntity<K extends readonly EntityKeys<T>[]>(
      entityId: string,
      types: [...K],
      // biome-ignore lint/complexity/noBannedTypes: in this case an empty object is fine
      updates: Partial<MergedEntityType<T, K, {}>>, // allow partial updates
    ): boolean {
      if (types.length === 0) {
        throw new Error('Entity must have at least one type');
      }

      const mergedSchema = buildMergedSchema(types);

      let success = false;

      console.log('updateEntity', entityId, types, updates);
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
