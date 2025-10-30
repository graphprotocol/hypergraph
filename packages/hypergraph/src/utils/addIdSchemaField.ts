import * as Schema from 'effect/Schema';

export const addIdSchemaField = <S extends Schema.Schema.AnyNoContext>(schema: S) =>
  Schema.asSchema(Schema.extend(Schema.Struct({ id: Schema.String }))(schema)) as Schema.Schema<
    Schema.Schema.Type<S> & { readonly id: string },
    Schema.Schema.Encoded<S> & { readonly id: string },
    never
  >;
