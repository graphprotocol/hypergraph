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

// Function to create schema functions
export function createFunctions<
  Attributes extends { [attrName: string]: S.Schema<any> },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
>({ attributes, types }: { attributes: Attributes; types: Types }) {
  // Build attribute schemas
  const attributeSchemas: {
    [K in keyof Attributes]: Attributes[K];
  } = attributes;

  // Build type schemas
  const typeSchemas: {
    [K in keyof Types]: S.Schema<{
      [AttrName in Types[K][number]]: S.Schema.Type<
        (typeof attributeSchemas)[AttrName]
      >;
    }>;
  } = {} as any;

  for (const typeName in types) {
    const attrNames = types[typeName as keyof Types];
    const attrSchemaEntries: any = {};
    for (const attrName of attrNames) {
      const attrSchema = attributeSchemas[attrName];
      if (!attrSchema) {
        throw new Error(`Attribute ${String(attrName)} is not defined`);
      }
      attrSchemaEntries[attrName as string] = attrSchema;
    }
    typeSchemas[typeName as keyof Types] = S.Struct(attrSchemaEntries) as any;
  }

  // Type for merged types
  type TypeSchemasMap = typeof typeSchemas;

  type TypeSchemaTypes<T extends keyof TypeSchemasMap> = S.Schema.Type<
    TypeSchemasMap[T]
  >;

  type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  type MergedType<T extends (keyof TypeSchemasMap)[]> = UnionToIntersection<
    TypeSchemaTypes<T[number]>
  >;

  // Helper function to build merged schema
  function buildMergedSchema<TypeNames extends (keyof TypeSchemasMap)[]>(
    typesToCombine: [...TypeNames]
  ): S.Schema<any> {
    const mergedFields: Record<string, S.Schema<any>> = {};

    for (const typeName of typesToCombine) {
      const schema = typeSchemas[typeName];
      const structSchema = schema as S.Schema<any> & {
        fields: Record<string, S.Schema<any>>;
      };

      if ("fields" in structSchema) {
        Object.assign(mergedFields, structSchema.fields);
      } else {
        throw new Error(`Schema for type ${String(typeName)} is not a struct`);
      }
    }

    return S.Struct(mergedFields);
  }

  // Create a React Context to provide the schema
  type SpaceContextProps = {
    id: string;
  };

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

    function createEntity<TypeNames extends (keyof TypeSchemasMap)[]>(
      types: [...TypeNames],
      data: MergedType<TypeNames>
    ): MergedType<TypeNames> {
      if (types.length === 0) {
        throw new Error("Entity must have at least one type");
      }

      const mergedSchema = buildMergedSchema(types);
      const result = S.decodeUnknownSync(mergedSchema)(data);

      changeDoc((doc) => {
        if (!doc.entities) {
          doc.entities = {};
        }
        const entityId = createDocumentId();
        doc.entities[entityId] = { ...result, types };
      });

      return result as MergedType<TypeNames>;
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

  function useQuery<TypeNames extends (keyof TypeSchemasMap)[]>({
    types,
    where,
  }: {
    types: [...TypeNames];
    where?: {
      [AttrName in keyof Attributes]?: {
        equals?: S.Schema.Type<Attributes[AttrName]>;
        contains?: S.Schema.Type<Attributes[AttrName]>;
      };
    };
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
      (): Record<string, MergedType<TypeNames>> => {
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
        const filteredEntities: Record<string, MergedType<TypeNames>> = {};
        for (const entityId in doc.entities) {
          const entity = doc.entities[entityId];
          if (types.every((type) => entity.types.includes(type as string))) {
            filteredEntities[entityId] = entity as MergedType<TypeNames>;
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
