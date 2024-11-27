import { type AnyDocumentId, type DocHandle, Repo } from '@automerge/automerge-repo';
import { RepoContext, useDocument, useRepo } from '@automerge/automerge-repo-react-hooks';
import * as S from 'effect/Schema';
import fastDeepEqual from 'fast-deep-equal';
import { type ReactNode, createContext, useCallback, useContext, useRef, useSyncExternalStore } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: typedefs are unknown and determined by the schema. todo: figure out a way to make generic?
type SchemaTypeUnknown = any;

interface SpaceProviderProps {
  children: ReactNode;
  id: string;
}

type DocumentContent = {
  entities: Record<string, SchemaTypeUnknown>;
};

export const repo = new Repo({
  network: [],
});

export const type = {
  Text: S.String,
  Number: S.Number,
  Checkbox: S.Boolean,
  Relation: <K extends readonly string[], C extends 'one' | 'many'>(params: {
    types: K;
    cardinality: C;
  }): Relation<K, C> => {
    const { types, cardinality } = params;
    return {
      _tag: 'Relation',
      types,
      cardinality,
    };
  },
};

type BaseEntity = {
  id: string;
  types: string[];
};

// Helper type to extract schema type
type SchemaType<T> = T extends S.Schema<SchemaTypeUnknown, infer A> ? A : never;

// Generic Relation type
type Relation<K extends readonly string[], C extends 'one' | 'many' = 'one'> = {
  _tag: 'Relation';
  types: K;
  cardinality?: C;
};

// Type for the schema structure
export type SchemaDefinition = {
  types: Record<
    string,
    Record<string, S.Schema<SchemaTypeUnknown, SchemaTypeUnknown> | Relation<SchemaTypeUnknown, SchemaTypeUnknown>>
  >;
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
      [P in keyof T['types'][K]]: T['types'][K][P] extends Relation<infer R, infer C>
        ? C extends 'many'
          ? MergedEntityType<T, Extract<R[number], EntityKeys<T>>[], Additional>[]
          : MergedEntityType<T, Extract<R[number], EntityKeys<T>>[], Additional>
        : SchemaType<T['types'][K][P]>;
    };
  }[Keys[number]]
> &
  Additional;

// Helper function to check if a property is a Relation
function isRelation(
  prop: S.Schema<SchemaTypeUnknown, SchemaTypeUnknown> | Relation<SchemaTypeUnknown, SchemaTypeUnknown>,
): prop is Relation<SchemaTypeUnknown, SchemaTypeUnknown> {
  return (prop as Relation<SchemaTypeUnknown, SchemaTypeUnknown>)._tag === 'Relation';
}

// Helper type to convert union to intersection
type UnionToIntersection<U> = (U extends SchemaTypeUnknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

// Function to create schema functions
export function createFunctions<T extends SchemaDefinition>(schema: T) {
  // Create a React Context to provide the schema
  type SpaceContextProps = {
    id: string;
  };

  function buildMergedSchema<K extends readonly EntityKeys<T>[]>(
    types: [...K],
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
  ): S.Schema<SchemaTypeUnknown, MergedEntityType<T, K, {}>> {
    // Create a record of all properties and their schemas
    const propertySchemas = types.reduce(
      (acc, type) => {
        const typeSchema = schema.types[type];

        for (const [key, prop] of Object.entries(typeSchema)) {
          if (isRelation(prop)) {
            // Handle Relation
            const relationProp = prop as Relation<SchemaTypeUnknown, SchemaTypeUnknown>;

            // Build schemas for each related type
            // @ts-expect-error
            const relatedSchemas = relationProp.types.map((relatedType) => {
              return buildMergedSchema([relatedType]);
            });

            // Create a union of related schemas
            const unionSchema = relatedSchemas.length === 1 ? relatedSchemas[0] : S.Union(...relatedSchemas);

            let schemaWithCardinality: S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>;

            if (relationProp.cardinality === 'many') {
              // Relation is an array
              // @ts-expect-error
              schemaWithCardinality = S.Array(unionSchema);
            } else {
              // Relation is a single object
              schemaWithCardinality = unionSchema;
            }

            acc[key] = schemaWithCardinality;
          } else {
            // Regular property
            acc[key] = prop as S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>;
          }
        }

        return acc;
      },
      {} as Record<string, S.Schema<SchemaTypeUnknown, SchemaTypeUnknown>>,
    );

    // Convert the record to a struct schema
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    return S.Struct(propertySchemas) as unknown as S.Schema<SchemaTypeUnknown, MergedEntityType<T, K, {}>>;
  }

  const SpaceContext = createContext<SpaceContextProps | undefined>(undefined);

  function SpaceProvider({ children, id }: SpaceProviderProps) {
    const contextValue: SpaceContextProps = {
      id,
    };

    return (
      <RepoContext.Provider value={repo}>
        <SpaceContext.Provider value={contextValue}>{children}</SpaceContext.Provider>
      </RepoContext.Provider>
    );
  }

  const useSpaceId = () => {
    const context = useContext(SpaceContext);
    if (!context) {
      throw new Error('useSpaceId must be used within a SpaceProvider');
    }
    return context?.id;
  };

  const createDocumentId = () => {
    const { documentId } = repo.create();
    return documentId;
  };

  function useCreateEntity() {
    const id = useSpaceId();
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

      const relationalEntities: Record<string, SchemaTypeUnknown> = {};

      const mergedSchema = buildMergedSchema(types);
      const result = S.decodeUnknownSync(mergedSchema)(data);

      // Implementing the TODO: Extract relational entities
      const resultWithRefs = extractRelationalEntities(result, types);

      changeDoc((doc) => {
        if (!doc.entities) {
          doc.entities = {};
        }
        // Add all relational entities to the document
        for (const entityId in relationalEntities) {
          doc.entities[entityId] = relationalEntities[entityId];
        }
        // Add the main entity
        const entityId = createDocumentId();
        doc.entities[entityId] = { ...resultWithRefs, types };
      });

      return result as MergedEntityType<T, K, BaseEntity>;

      // Helper function to extract relational entities
      function extractRelationalEntities(
        data: SchemaTypeUnknown,
        entityTypes: readonly EntityKeys<T>[],
      ): SchemaTypeUnknown {
        const resultData = { ...data };
        for (const entityType of entityTypes) {
          const typeSchema = schema.types[entityType];
          for (const key of Object.keys(typeSchema)) {
            const prop = typeSchema[key];
            if (isRelation(prop)) {
              const relationProp = prop as Relation<SchemaTypeUnknown, SchemaTypeUnknown>;
              const { types: relatedTypes, cardinality } = relationProp;
              const relatedData = data[key];
              if (relatedData !== undefined) {
                if (cardinality === 'many') {
                  // Handle array of related entities
                  if (Array.isArray(relatedData)) {
                    const relatedEntityIds = relatedData.map((item: SchemaTypeUnknown) => {
                      const entityId = createDocumentId();
                      const extractedData = extractRelationalEntities(item, relatedTypes);
                      relationalEntities[entityId] = {
                        ...extractedData,
                        types: relatedTypes,
                      };
                      return entityId;
                    });
                    resultData[key] = relatedEntityIds;
                  } else {
                    throw new Error(`Expected an array for property "${key}" with cardinality "many"`);
                  }
                } else {
                  // Handle single related entity
                  const entityId = createDocumentId();
                  const extractedData = extractRelationalEntities(relatedData, relatedTypes);
                  relationalEntities[entityId] = {
                    ...extractedData,
                    types: relatedTypes,
                  };
                  resultData[key] = entityId;
                }
              }
            }
          }
        }
        return resultData;
      }
    }

    return createEntity;
  }

  function useDeleteEntity() {
    const id = useSpaceId();

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
    const id = useSpaceId();
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

      // Create filteredEntities object with only entities that include all the types
      const filteredEntities: Record<string, MergedEntityType<T, K, BaseEntity>> = {};
      for (const entityId in doc.entities) {
        const entity = doc.entities[entityId];
        if (types.every((type) => entity.types.includes(type as string))) {
          filteredEntities[entityId] = entity as MergedEntityType<T, K, BaseEntity>;
        }
      }

      // Go through all filteredEntities and replace relational entity IDs with the actual entities recursively
      const visitedEntities = new Set<string>();
      for (const entityId in filteredEntities) {
        const entity = filteredEntities[entityId];
        const resolvedEntity = resolveEntity(entityId, entity, entity.types, visitedEntities);
        filteredEntities[entityId] = resolvedEntity;
      }

      const filteredEntitiesArray = Object.values(filteredEntities);

      if (fastDeepEqual(prevEntitiesRef.current, filteredEntitiesArray)) {
        return prevEntitiesRef.current;
        // biome-ignore lint/style/noUselessElse: <explanation>
      } else {
        prevEntitiesRef.current = filteredEntitiesArray;
        return prevEntitiesRef.current;
      }

      // Helper function to resolve entities recursively
      function resolveEntity(
        entityId: string,
        entity: SchemaTypeUnknown,
        entityTypes: readonly EntityKeys<T>[],
        visited: Set<string>,
      ): SchemaTypeUnknown {
        if (visited.has(entityId)) {
          // Circular reference detected
          return entity; // Return as is or handle accordingly
        }
        visited.add(entityId);
        const resolvedEntity = { ...entity, id: entityId };
        for (const entityType of entityTypes) {
          const typeSchema = schema.types[entityType];
          for (const key in typeSchema) {
            const prop = typeSchema[key];
            if (isRelation(prop)) {
              const relationProp = prop as Relation<SchemaTypeUnknown, SchemaTypeUnknown>;
              const { cardinality } = relationProp;
              const relationValue = entity[key];
              if (relationValue !== undefined) {
                if (cardinality === 'many') {
                  // Relation is an array of IDs
                  if (Array.isArray(relationValue)) {
                    const resolvedArray = relationValue.map((id: string) => {
                      if (visited.has(id)) {
                        return null; // Handle circular reference
                      }
                      // @ts-expect-error
                      const relatedEntity = doc.entities[id];
                      if (relatedEntity) {
                        return resolveEntity(id, relatedEntity, relatedEntity.types, new Set(visited));
                        // biome-ignore lint/style/noUselessElse: <explanation>
                      } else {
                        return null; // Or handle missing entities
                      }
                    });
                    resolvedEntity[key] = resolvedArray;
                  } else {
                    // Expected an array, but got something else
                    resolvedEntity[key] = [];
                  }
                } else {
                  // Relation is a single ID
                  const id = relationValue;
                  if (visited.has(id)) {
                    resolvedEntity[key] = null; // Handle circular reference
                  } else {
                    // @ts-expect-error
                    const relatedEntity = doc.entities[id];
                    if (relatedEntity) {
                      resolvedEntity[key] = resolveEntity(id, relatedEntity, relatedEntity.types, new Set(visited));
                    } else {
                      resolvedEntity[key] = null; // Or handle missing entities
                    }
                  }
                }
              }
            }
          }
        }
        return resolvedEntity;
      }

      // Helper function to check if a property is a Relation
      function isRelation(
        prop: S.Schema<SchemaTypeUnknown, SchemaTypeUnknown> | Relation<SchemaTypeUnknown, SchemaTypeUnknown>,
      ): prop is Relation<SchemaTypeUnknown, SchemaTypeUnknown> {
        return (prop as Relation<SchemaTypeUnknown, SchemaTypeUnknown>)._tag === 'Relation';
      }
    });

    return entities;
  }

  return {
    useCreateEntity,
    useDeleteEntity,
    useQuery,
    SpaceProvider,
    useSpaceId,
    createDocumentId,
  };
}
