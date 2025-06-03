import * as Schema from 'effect/Schema';

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
  directory: Schema.NullOr(Schema.String),
  status: Schema.Literal('draft', 'generated', 'published', 'change_detected'),
  created_at: Schema.NonEmptyTrimmedString,
  updated_at: Schema.NonEmptyTrimmedString,
}) {}

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
export const InsertAppEventSchema = Schema.Struct(AppEvent.fields).pipe(
  Schema.pick('app_id', 'event_type', 'metadata'),
);
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

export const InsertAppSchemaType = AppSchemaType.pipe(Schema.pick('app_id', 'name'));
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
    examples: ['Text', 'Number', 'Boolean'],
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

export const InsertAppSchemaTypeProperty = AppSchemaTypePropery.pipe(
  Schema.pick('name', 'type_name', 'description', 'nullable', 'optional', 'app_schema_type_id'),
);
export type InsertAppSchemaTypeProperty = typeof InsertAppSchemaTypeProperty.Type;

// sqlite3 does not natively support boolean.
// replace the boolean and optional types with a nullable integer of value 0 or 1 (0 = false, 1 = true)
export const DBNativeAppSchemaTypeProperty = AppSchemaTypePropery.pipe(
  Schema.omit('nullable', 'optional'),
  Schema.extend(
    Schema.Struct({
      nullable: Schema.NullOr(Schema.Literal(0, 1)),
      optional: Schema.NullOr(Schema.Literal(0, 1)),
    }),
  ),
);
export type DBNativeAppSchemaTypeProperty = typeof DBNativeAppSchemaTypeProperty.Type;

export const DBNativeInsertAppSchemaTypeProperty = InsertAppSchemaTypeProperty.pipe(
  Schema.omit('nullable', 'optional'),
  Schema.extend(
    Schema.Struct({
      nullable: Schema.NullOr(Schema.Literal(0, 1)),
      optional: Schema.NullOr(Schema.Literal(0, 1)),
    }),
  ),
);
export type DBNativeInsertAppSchemaTypeProperty = typeof DBNativeInsertAppSchemaTypeProperty.Type;

export function mapBooleanToSqliteNative(value: boolean | null): 0 | 1 | null {
  if (value == null) {
    return null;
  }
  return value ? 1 : 0;
}
export function mapSqliteNativeToBoolean(value: 0 | 1 | null): boolean | null {
  if (value == null) {
    return null;
  }
  return value === 1;
}

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
              properties: Schema.Array(InsertAppSchemaTypeProperty.pipe(Schema.omit('app_schema_type_id'))).pipe(
                Schema.minItems(1),
              ),
            }),
          ),
        ),
      ).pipe(Schema.minItems(1)),
    }),
  ),
).annotations({
  identifier: 'App Schema',
  title: 'App with built schema definitions',
  description: 'The app record with built out schema with types and properties',
  documentation: 'The app record with built out schema with types and properties',
  examples: [
    {
      name: 'Mesh',
      description: 'Event builder powered by Hypergraph',
      directory: '~/dev/mesh',
      template: 'vite_react',
      types: [
        {
          name: 'Event',
          properties: [
            {
              name: 'id',
              type_name: 'Number',
              description: 'unique id of the Event on hypergraph',
              nullable: false,
              optional: false,
            },
            {
              name: 'name',
              type_name: 'Text',
              description: 'Event name',
              nullable: false,
              optional: false,
            },
          ],
        },
      ],
    },
  ],
});
export type InsertAppSchema = typeof InsertAppSchema.Type;
