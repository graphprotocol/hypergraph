import * as Schema from 'effect/Schema';

// default schema types
export const Text = Schema.String;
export const SchemaNumber = Schema.Number;
export const Checkbox = Schema.Boolean;
export const SchemaObject = Schema.Object;

export const DefaultSchemaTypes = [Text, SchemaNumber, Checkbox, SchemaObject] as const;

export const AppSchemaField = Schema.Struct({
  name: Schema.NonEmptyTrimmedString,
  typeName: Schema.NonEmptyTrimmedString,
  nullable: Schema.NullOr(Schema.Boolean).pipe(Schema.optional),
  optional: Schema.NullOr(Schema.Boolean).pipe(Schema.optional),
  description: Schema.NullOr(Schema.String).pipe(Schema.optional),
});
export type AppSchemaField = typeof AppSchemaField.Type;
export const AppSchemaType = Schema.Struct({
  name: Schema.NonEmptyTrimmedString,
  properties: Schema.Array(AppSchemaField).pipe(Schema.minItems(1)),
});
export const AppSchemaForm = Schema.Struct({
  types: Schema.Array(AppSchemaType).pipe(Schema.minItems(1)),
});
export type AppSchemaForm = typeof AppSchemaForm.Type;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AppSchemaTypeUnknown = any;
