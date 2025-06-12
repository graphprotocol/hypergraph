import { Array as EffectArray, String as EffectString, Schema, pipe } from 'effect';

export const AppIdentifier = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.annotations({
    identifier: 'AppId',
    title: 'App identifier',
    description: 'The unique numerical identifier of an app',
    documentation: 'The unique numerical identifier of an app',
  }),
);

export class App extends Schema.Class<App>('App')({
  id: AppIdentifier,
  name: Schema.NonEmptyTrimmedString,
  description: Schema.NullOr(Schema.String),
  directory: Schema.NullOr(Schema.String.pipe(Schema.pattern(/^(\.\/|~\/|\/|[a-zA-Z]:\/)[\w\-\.\s\/]*[\w\-\.]$/))),
  status: Schema.Literal('draft', 'generated', 'published', 'change_detected'),
  created_at: Schema.NonEmptyTrimmedString,
  updated_at: Schema.NonEmptyTrimmedString,
}) {}

export const AppList = Schema.Array(App);
export type AppList = typeof AppList.Type;

export const AppListDecoder = Schema.decodeUnknownSync(AppList);

export const AppEventIdentifier = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.annotations({
    identifier: 'AppEventId',
    title: 'App Event identifier',
    description: 'The unique numerical identifier of an app event',
    documentation: 'The unique numerical identifier of an app event',
  }),
);

export class AppEvent extends Schema.Class<AppEvent>('AppEvent')({
  id: AppEventIdentifier,
  app_id: AppIdentifier,
  event_type: Schema.NonEmptyTrimmedString.pipe(
    Schema.compose(Schema.Literal('app_created', 'app_updated', 'schema_updated', 'generated', 'published')),
  ),
  metadata: Schema.NonEmptyTrimmedString,
  created_at: Schema.NonEmptyTrimmedString,
  updated_at: Schema.NonEmptyTrimmedString,
}) {}

export const AppEvents = Schema.Array(AppEvent);
export type AppEvents = typeof AppEvents.Type;

export const AppEventDecoder = Schema.decodeUnknownSync(AppEvent);
export const AppEventsDecoder = Schema.decodeUnknownSync(AppEvents);

export const InsertAppEventSchema = Schema.Struct(AppEvent.fields).pick('app_id', 'event_type', 'metadata');
export type InsertAppEventSchema = typeof InsertAppEventSchema.Type;

export const AppSchemaTypeIdentifier = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.annotations({
    identifier: 'AppSchemaTypeId',
    title: 'App Schema Type identifier',
    description: 'The unique numerical identifier of an app schema type',
    documentation: 'The unique numerical identifier of an app schema type',
  }),
);
export class AppSchemaType extends Schema.Class<AppSchemaType>('AppSchemaType')({
  id: AppSchemaTypeIdentifier,
  app_id: AppIdentifier,
  name: Schema.NonEmptyTrimmedString,
  created_at: Schema.NonEmptyTrimmedString,
  updated_at: Schema.NonEmptyTrimmedString,
}) {}

export const InsertAppSchemaType = Schema.Struct(AppSchemaType.fields).pick('app_id', 'name');
export type InsertAppSchemaType = typeof InsertAppSchemaType.Type;

export const AppSchemaTypePropertyIdentifier = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.annotations({
    identifier: 'AppSchemaTypePropertyId',
    title: 'App Schema Type Property identifier',
    description: 'The unique numerical identifier of an app schema type property record',
    documentation: 'The unique numerical identifier of an app schema type property record',
  }),
);
export class AppSchemaTypePropery extends Schema.Class<AppSchemaTypePropery>('AppSchemaTypePropery')({
  id: AppSchemaTypePropertyIdentifier,
  app_schema_type_id: AppSchemaTypeIdentifier,
  name: Schema.NonEmptyTrimmedString.annotations({
    identifier: 'AppSchemaTypePropertyName',
    title: 'App Schema Type Property name',
    description: 'The unique to the app schema type name of the property',
    documentation: 'The unique to the app schema type name of the property',
  }),
  type_name: Schema.NonEmptyTrimmedString.annotations({
    identifier: 'AppSchemaTypePropertyTypeName',
    title: 'App Schema Type Property type name',
    description:
      'The name of the property type. Each property will have a name and a type that is used to build the schema.',
    documentation:
      'The name of the property type. Each property will have a name and a type that is used to build the schema.',
    examples: ['Text', 'Number', 'Boolean', 'Date', 'Point', 'Relation(Account)'],
  }),
  nullable: Schema.NullOr(Schema.Boolean).annotations({
    identifier: 'AppSchemaTypePropertyNullable',
    title: 'App Schema Type Property nullable',
    description: 'If true, the property is nullable',
    documentation: 'If true, the property is nullable',
    default: null,
  }),
  optional: Schema.NullOr(Schema.Boolean).annotations({
    identifier: 'AppSchemaTypePropertyOptional',
    title: 'App Schema Type Property optional',
    description: 'If true, the property is optional (can be undefined)',
    documentation: 'If true, the property is optional (can be undefined)',
    default: null,
  }),
  description: Schema.NullOr(Schema.NonEmptyTrimmedString).annotations({
    identifier: 'AppSchemaTypePropertyDescription',
    title: 'App Schema Type Property description',
    description:
      'Provides JSDoc for the property to provide additional context of what the property represents in the schema.',
    documentation:
      'Provides JSDoc for the property to provide additional context of what the property represents in the schema.',
    default: null,
  }),
  created_at: Schema.NonEmptyTrimmedString,
  updated_at: Schema.NonEmptyTrimmedString,
}) {}

export const InsertAppSchemaTypeProperty = Schema.Struct(AppSchemaTypePropery.fields).pick(
  'name',
  'type_name',
  'description',
  'nullable',
  'optional',
  'app_schema_type_id',
);
export type InsertAppSchemaTypeProperty = typeof InsertAppSchemaTypeProperty.Type;

/** Provides a full view of the app with the built schema */
export class AppSchema extends Schema.Class<AppSchema>('AppSchema')({
  ...App.fields,
  types: Schema.Array(
    AppSchemaType.pipe(
      Schema.pick('id', 'name'),
      Schema.extend(
        Schema.Struct({
          properties: Schema.Array(
            AppSchemaTypePropery.pipe(
              Schema.pick('id', 'app_schema_type_id', 'name', 'type_name', 'optional', 'nullable', 'description'),
            ),
          ),
        }),
      ),
    ),
  ),
}) {}

export const AppSchemaDecoder = Schema.decodeUnknownSync(AppSchema);

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

function allRelationPropertyTypesExist(types: ReadonlyArray<SchemaType>): boolean {
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
    Schema.filter(allRelationPropertyTypesExist, {
      identifier: 'AllRelationTypesExist',
      jsonSchema: {},
      description: 'Each type property of dataType RELATION must have a type of the same name in the schema',
    }),
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
