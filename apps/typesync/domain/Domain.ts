import { Array as EffectArray, String as EffectString, Schema, pipe } from 'effect';

function namesAreUnique<T extends { readonly name: string }>(entries: ReadonlyArray<T>): boolean {
  const names = new Set<string>();

  for (const entry of entries) {
    const name = EffectString.toLowerCase(entry.name);
    if (names.has(name)) {
      return false;
    }
    names.add(name);
  }

  return true;
}

export type DataTypeRelation = `Relation(${string})`;
export function isDataTypeRelation(val: string): val is DataTypeRelation {
  return /^Relation\((.+)\)$/.test(val);
}

export const SchemaDataTypeRelation = Schema.NonEmptyTrimmedString.pipe(
  Schema.filter((val) => isDataTypeRelation(val)),
);
export type SchemaDataTypeRelation = typeof SchemaDataTypeRelation.Type;

export const SchemaDataTypePrimitive = Schema.Literal('Text', 'Number', 'Boolean', 'Date', 'Point', 'Url');
export type SchemaDataTypePrimitive = typeof SchemaDataTypePrimitive.Type;

export const SchemaDataType = Schema.Union(SchemaDataTypePrimitive, SchemaDataTypeRelation);
export type SchemaDataType = typeof SchemaDataType.Type;

export const SchemaTypePropertyRelation = Schema.Struct({
  name: Schema.NonEmptyTrimmedString,
  knowledgeGraphId: Schema.NullOr(Schema.UUID),
  dataType: Schema.NonEmptyTrimmedString, // The correct type for this is: `SchemaDataTypeRelation`. however, the standard schema definition to use in the form schema validation fails because of the `Relation(${string})` template string type.
  relationType: Schema.NonEmptyTrimmedString.annotations({
    identifier: 'SchemaTypePropertyRelation.relationType',
    description: 'name of the type within the schema that this property is related to',
    examples: ['Account'],
  }),
});
export type SchemaTypePropertyRelation = typeof SchemaTypePropertyRelation.Type;

export const SchemaTypePropertyPrimitive = Schema.Struct({
  name: Schema.NonEmptyTrimmedString,
  knowledgeGraphId: Schema.NullOr(Schema.UUID),
  dataType: SchemaDataTypePrimitive,
});
export type SchemaTypePropertyPrimitive = typeof SchemaTypePropertyPrimitive.Type;

export function propertyIsRelation(
  property: SchemaTypePropertyPrimitive | SchemaTypePropertyRelation,
): property is SchemaTypePropertyRelation {
  return isDataTypeRelation(property.dataType);
}

export const SchemaType = Schema.Struct({
  name: Schema.NonEmptyTrimmedString,
  knowledgeGraphId: Schema.NullOr(Schema.UUID),
  properties: Schema.Array(Schema.Union(SchemaTypePropertyPrimitive, SchemaTypePropertyRelation)).pipe(
    Schema.minItems(1),
    Schema.filter(namesAreUnique, {
      identifier: 'DuplicatePropertyNames',
      jsonSchema: {},
      description: 'The property.name must be unique across all properties in the type',
    }),
  ),
});
export type SchemaType = typeof SchemaType.Type;

export function allRelationPropertyTypesExist(types: ReadonlyArray<SchemaType>): boolean {
  const unqTypeNames = EffectArray.reduce(types, new Set<string>(), (names, curr) => names.add(curr.name));
  return pipe(
    types,
    EffectArray.flatMap((curr) => curr.properties),
    EffectArray.filter((prop) => propertyIsRelation(prop)),
    EffectArray.every((prop) => unqTypeNames.has(prop.relationType)),
  );
}

/**
 * Defines the type to be received by the app schema builder.
 * Used to create the app, app_schema_type and app_schema_type_property records
 */
export const InsertAppSchema = Schema.Struct({
  name: Schema.NonEmptyTrimmedString,
  description: Schema.NullOr(Schema.String),
  directory: Schema.NullOr(Schema.String.pipe(Schema.pattern(/^(\.\/|~\/|\/|[a-zA-Z]:\/)[\w\-\.\s\/]*[\w\-\.]$/))),
  template: Schema.Literal('vite_react'),
  types: Schema.Array(SchemaType).pipe(
    Schema.minItems(1),
    Schema.filter(namesAreUnique, {
      identifier: 'DuplicateTypeNames',
      jsonSchema: {},
      description: 'The type.name must be unique across all types in the schema',
    }),
    // todo add back once issues resolved
    // Schema.filter(allRelationPropertyTypesExist, {
    //   identifier: 'AllRelationTypesExist',
    //   jsonSchema: {},
    //   description: 'Each type property of dataType RELATION must have a type of the same name in the schema',
    // }),
  ),
}).annotations({
  identifier: 'typesync/Schema',
  title: 'TypeSync app Schema',
  examples: [
    {
      name: 'Mesh',
      description: 'Track and attend events',
      directory: '/Users/me/dev/mesh',
      template: 'vite_react',
      types: [
        {
          name: 'Account',
          knowledgeGraphId: null,
          properties: [{ name: 'username', knowledgeGraphId: null, dataType: 'Text' }],
        },
        {
          name: 'Event',
          knowledgeGraphId: null,
          properties: [
            { name: 'speaker', knowledgeGraphId: null, dataType: 'Relation(Account)', relationType: 'Account' },
          ],
        },
      ],
    },
  ],
});
export type InsertAppSchema = typeof InsertAppSchema.Type;
