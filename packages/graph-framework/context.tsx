import * as S from "@effect/schema/Schema";
import { createContext, ReactNode, useContext } from "react";

// Function to create schema functions
function createFunctions<
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

  // createEntity function with type safety
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

    return result as MergedType<TypeNames>;
  }

  return {
    createEntity,
  };
}

const attributes = {
  name: S.String,
  age: S.Number,
  isActive: S.Boolean,
  email: S.String,
} as const;

const types = {
  Person: ["name", "age"] as const,
  User: ["name", "email", "isActive"] as const,
} as const;

// Create a React Context to provide the schema
type SpaceContextProps<
  Attributes extends { [attrName: string]: S.Schema<any, any, never> },
  Types extends { [typeName: string]: readonly (keyof Attributes)[] },
> = {
  attributes: Attributes;
  types: Types;
  createEntity: ReturnType<
    typeof createFunctions<Attributes, Types>
  >["createEntity"];
};

const SpaceContext = createContext<SpaceContextProps<any, any> | undefined>(
  undefined
);

interface SpaceProviderProps<
  Attributes extends { [attrName: string]: S.Schema<any> },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
> {
  schema: { attributes: Attributes; types: Types };
  children: ReactNode;
}

export function SpaceProvider<
  Attributes extends { [attrName: string]: S.Schema<any> },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
>({ schema, children }: SpaceProviderProps<Attributes, Types>) {
  const { createEntity } = createFunctions(schema);

  const contextValue: SpaceContextProps<Attributes, Types> = {
    ...schema,
    createEntity,
  };

  return (
    <SpaceContext.Provider value={contextValue}>
      {children}
    </SpaceContext.Provider>
  );
}

// Custom hook to use the schema context
export function useSchema<
  Attributes extends { [attrName: string]: S.Schema<any> },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
>() {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error("useSchema must be used within a SpaceProvider");
  }
  return context as SpaceContextProps<Attributes, Types>;
}

// Custom hook to use the createEntity function
export function useCreateEntity() {
  const { createEntity } = useSchema<typeof attributes, typeof types>();
  return createEntity;
}

const { createEntity } = createFunctions({ attributes, types });

// Creating an entity combining 'Person' and 'User' types
const personUser = createEntity({
  types: ["Person", "User"],
  data: {
    name: "Alice",
    age: 30,
    email: "alice@example.com",
    isActive: true,
  },
});

// personUser is now strongly typed with all attributes from 'Person' and 'User'
console.log(personUser);
