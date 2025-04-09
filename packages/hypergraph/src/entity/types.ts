import type * as Schema from 'effect/Schema';

export type Any = Schema.Schema.Any & {
  readonly fields: Schema.Struct.Fields;
  readonly insert: Schema.Schema.Any;
  readonly update: Schema.Schema.Any;
};

export type AnyNoContext = Schema.Schema.AnyNoContext & {
  readonly fields: Schema.Struct.Fields;
  readonly insert: Schema.Schema.AnyNoContext;
  readonly update: Schema.Schema.AnyNoContext;
};

export type Update<S extends Any> = S['update'];
export type Insert<S extends Any> = S['insert'];

export type Entity<S extends AnyNoContext> = Schema.Schema.Type<S> & { type: string };

export type DocumentEntity = {
  __deleted: boolean;
  [key: string]: unknown;
};

export type DocumentRelation = {
  from: string;
  to: string;
  fromTypeName: string;
  fromPropertyName: string;
  __deleted: boolean;
  [key: string]: unknown;
};

export type DocumentContent = {
  entities?: Record<string, DocumentEntity>;
  relations?: Record<string, DocumentRelation>;
};
