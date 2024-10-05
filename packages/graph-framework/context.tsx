import { AnyDocumentId, Repo } from "@automerge/automerge-repo";
import {
  RepoContext,
  useDocument,
} from "@automerge/automerge-repo-react-hooks";
import * as S from "@effect/schema/Schema";
import { createContext, ReactNode, useContext } from "react";

interface SpaceProviderProps {
  children: ReactNode;
  id: string;
}

const repo = new Repo({
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

  // Custom hook to use the createEntity function
  function useCreateEntity() {
    const id = useSpaceId();
    const [doc, changeDoc] = useDocument(id as AnyDocumentId);

    console.log("useCreateEntity doc", doc);

    function createEntity<TypeNames extends (keyof TypeSchemasMap)[]>({
      types,
      data,
    }: {
      types: [...TypeNames];
      data: MergedType<TypeNames>;
    }): MergedType<TypeNames> {
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
        doc.entities[entityId] = {
          types,
          data: result,
        };
      });

      return result as MergedType<TypeNames>;
    }

    return createEntity;
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
    const id = useSpaceId();
    const [doc] = useDocument(id as AnyDocumentId);

    const entities = doc.entities || {};

    // iterate over entities and get the property data
    const result: Record<string, MergedType<TypeNames>> = {};

    for (const entityId in entities) {
      result[entityId] = entities[entityId].data as MergedType<TypeNames>;
    }

    return result;
  }

  return {
    useCreateEntity,
    useQuery,
    SpaceProvider,
    useSpaceId,
    createDocumentId,
  };
}
