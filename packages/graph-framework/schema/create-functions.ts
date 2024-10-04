import * as S from "@effect/schema/Schema";

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
