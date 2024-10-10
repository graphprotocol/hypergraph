import { AnyDocumentId, DocHandle, Repo } from "@automerge/automerge-repo";
import {
  RepoContext,
  useDocument,
  useRepo,
} from "@automerge/automerge-repo-react-hooks";
import * as S from "@effect/schema/Schema";
import fastDeepEqual from "fast-deep-equal";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
} from "react";

interface SpaceProviderProps {
  children: ReactNode;
  id: string;
}

type DocumentContent = {
  entities: Record<string, any>;
};

export const repo = new Repo({
  network: [],
});

export const type = {
  Text: S.String,
  Number: S.Number,
  Checkbox: S.Boolean,
  Relation: <K extends readonly string[]>(types: K) => {
    const type: Relation<K> = {
      _tag: "Relation",
      types,
    };
    return type;
  },
};

// Helper type to extract schema type
type SchemaType<T> = T extends S.Schema<any, infer A> ? A : never;

// Generic Relation type
type Relation<K extends readonly string[]> = {
  _tag: "Relation";
  types: K;
};

// Type for the schema structure
export type SchemaDefinition = {
  types: Record<string, Record<string, S.Schema<any, any> | Relation<any>>>;
};

// Extract all possible keys from schema types
type EntityKeys<T extends SchemaDefinition> = keyof T["types"] & string;

// Get merged type from array of keys
type MergedEntityType<
  T extends SchemaDefinition,
  Keys extends readonly EntityKeys<T>[],
> = UnionToIntersection<
  {
    [K in Keys[number]]: {
      [P in keyof T["types"][K]]: T["types"][K][P] extends Relation<
        infer R extends readonly any[]
      >
        ? MergedEntityType<T, Extract<R[number], EntityKeys<T>>[]>
        : SchemaType<T["types"][K][P]>;
    };
  }[Keys[number]]
>;

// Helper type to convert union to intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// Function to create schema functions
export function createFunctions<T extends SchemaDefinition>(schema: T) {
  // Create a React Context to provide the schema
  type SpaceContextProps = {
    id: string;
  };

  function buildMergedSchema<K extends readonly EntityKeys<T>[]>(
    types: [...K]
  ): S.Schema<any, MergedEntityType<T, K>> {
    // Create a record of all properties and their schemas
    const propertySchemas = types.reduce(
      (acc, type) => {
        const typeSchema = schema.types[type];
        return { ...acc, ...typeSchema };
      },
      {} as Record<string, S.Schema<any, any>>
    );

    // Convert the record to a struct schema
    return S.Struct(propertySchemas) as unknown as S.Schema<
      any,
      MergedEntityType<T, K>
    >;
  }

  const SpaceContext = createContext<SpaceContextProps | undefined>(undefined);

  function SpaceProvider({ children, id }: SpaceProviderProps) {
    const contextValue: SpaceContextProps = {
      id,
    };

    return (
      <RepoContext.Provider value={repo}>
        <SpaceContext.Provider value={contextValue}>
          {children}
        </SpaceContext.Provider>
      </RepoContext.Provider>
    );
  }

  const useSpaceId = () => {
    const context = useContext(SpaceContext);
    if (!context) {
      throw new Error("useSpaceId must be used within a SpaceProvider");
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
      data: MergedEntityType<T, K>
    ): MergedEntityType<T, K> {
      if (types.length === 0) {
        throw new Error("Entity must have at least one type");
      }

      const relationalEntities: Record<string, any> = {};

      const mergedSchema = buildMergedSchema(types);
      const result = S.decodeUnknownSync(mergedSchema)(data);

      // identify relational entities and create them
      for (const key in result) {
        const value = result[key];

        // get the entry of the mergedSchema based on the key
        // @ts-expect-error - this is a hack to access the _kind property
        const field = mergedSchema.fields[key];

        if (field._kind === "relation") {
          const entityId = createDocumentId();
          relationalEntities[entityId] = { ...value, types: field._types };
          result[key] = entityId;
        }
      }

      changeDoc((doc) => {
        if (!doc.entities) {
          doc.entities = {};
        }
        for (const entityId in relationalEntities) {
          doc.entities[entityId] = relationalEntities[entityId];
        }
        const entityId = createDocumentId();
        doc.entities[entityId] = { ...result, types };
      });

      return result as MergedEntityType<T, K>;
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
      [id]
    );

    return deleteEntity;
  }

  function useQuery<K extends readonly EntityKeys<T>[]>({
    types,
  }: {
    types: [...K];
  }) {
    const prevEntitiesRef = useRef<any>({});
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

      handle?.on("change", handleChange);
      handle?.on("delete", handleDelete);

      return () => {
        handle?.off("change", handleChange);
        handle?.off("delete", handleDelete);
      };
    };

    const entities = useSyncExternalStore(
      subscribe,
      (): Record<string, MergedEntityType<T, K>> => {
        const doc = handle?.docSync();
        if (!doc) {
          if (fastDeepEqual(prevEntitiesRef.current, {})) {
            return prevEntitiesRef.current;
          } else {
            prevEntitiesRef.current = {};
            return {};
          }
        }

        // create filteredEntities object with only entities that include all the types
        const filteredEntities: Record<string, MergedEntityType<T, K>> = {};
        for (const entityId in doc.entities) {
          const entity = doc.entities[entityId];
          if (types.every((type) => entity.types.includes(type as string))) {
            filteredEntities[entityId] = entity as MergedEntityType<T, K>;
          }
        }

        // go through all filteredEntities and replace relational entity ids with the actual entity
        for (const entityId in filteredEntities) {
          const entity = filteredEntities[entityId];
          for (const key in entity) {
            const relationId = entity[key];
            if (key !== "types") {
              // @ts-expect-error
              const field = buildMergedSchema(entity.types).fields[key];

              if (field._kind === "relation") {
                // @ts-expect-error
                const relationalEntity = doc.entities[relationId];
                if (relationalEntity) {
                  entity[key] = relationalEntity;
                }
              }
            }
          }
        }

        if (fastDeepEqual(prevEntitiesRef.current, filteredEntities)) {
          return prevEntitiesRef.current;
        } else {
          prevEntitiesRef.current = filteredEntities;
          return prevEntitiesRef.current;
        }
      }
    );

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
