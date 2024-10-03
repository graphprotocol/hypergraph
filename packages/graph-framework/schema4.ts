import * as S from "@effect/schema/Schema";

// Define base attribute types
const AttributeTypes = {
  string: S.String,
  number: S.Number,
  boolean: S.Boolean,
} as const;
type BaseType = keyof typeof AttributeTypes;

// Function to define the schema
function defineSchema<
  Attributes extends { [attrName: string]: BaseType },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
>({ attributes, types }: { attributes: Attributes; types: Types }) {
  // Build attribute schemas
  const attributeSchemas: {
    [K in keyof Attributes]: (typeof AttributeTypes)[Attributes[K]];
  } = {} as any;

  for (const attrName in attributes) {
    const baseType = attributes[attrName];
    const schemaType = AttributeTypes[baseType];
    attributeSchemas[attrName as keyof Attributes] = schemaType;
  }

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
  function createEntity<TypeNames extends (keyof TypeSchemasMap)[]>(
    typesToCombine: [...TypeNames],
    data: MergedType<TypeNames>
  ): MergedType<TypeNames> {
    if (typesToCombine.length === 0) {
      throw new Error("Entity must have at least one type");
    }

    const mergedSchema = buildMergedSchema(typesToCombine);
    const result = S.decode(mergedSchema)(data);

    // Adjust this based on how decode returns the result in your version
    if (result._tag === "Left") {
      throw new Error(`Validation failed: ${JSON.stringify(result.left)}`);
    }

    return result.right as MergedType<TypeNames>;
  }

  return {
    createEntity,
  };
}

const attributes = {
  name: "string",
  age: "number",
  isActive: "boolean",
  email: "string",
} as const;

const types = {
  Person: ["name", "age"] as const,
  User: ["name", "email", "isActive"] as const,
} as const;

const { createEntity } = defineSchema({ attributes, types });

// Creating an entity combining 'Person' and 'User' types
const personUser = createEntity(["Person", "User"], {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
  isActive: true,
});

// personUser is now strongly typed with all attributes from 'Person' and 'User'
console.log(personUser);
