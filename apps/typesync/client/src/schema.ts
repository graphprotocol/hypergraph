import * as Schema from 'effect/Schema';

export type Relation = `Relation(${string})`;
export function isRelation(val: string): val is Relation {
  return val.startsWith('Relation(') && val.endsWith(')');
}

export const SchemaTypeName = Schema.Union(
  Schema.Literal('Text', 'Number', 'Boolean', 'Date', 'Point', 'Url'),
  Schema.String.pipe(Schema.filter((val) => isRelation(val))),
);
export type SchemaTypeName = typeof SchemaTypeName.Type;

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

/**
 * Defines the type to be received by the app schema builder.
 * Used to create the app, app_schema_type and app_schema_type_property records
 */
export const InsertAppSchema = App.pipe(
  Schema.pick('name', 'description', 'directory'),
  Schema.extend(
    Schema.Struct({
      template: Schema.Literal('vite_react'),
      types: Schema.Array(
        InsertAppSchemaType.pipe(
          Schema.omit('app_id'),
          Schema.extend(
            Schema.Struct({
              knowledge_graph_id: Schema.NullOr(Schema.UUID),
              properties: Schema.Array(
                InsertAppSchemaTypeProperty.omit('app_schema_type_id', 'description', 'nullable', 'optional').pipe(
                  Schema.extend(
                    Schema.Struct({
                      knowledge_graph_id: Schema.NullOr(Schema.UUID),
                    }),
                  ),
                ),
              ).pipe(Schema.minItems(1)),
            }),
          ),
        ),
      ).pipe(Schema.minItems(1)),
    }),
  ),
);
export type InsertAppSchema = typeof InsertAppSchema.Type;
