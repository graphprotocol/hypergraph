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

export type Entity<S extends AnyNoContext> = Schema.Schema.Type<S> & {
  type: string;
  // TODO: can we solve this directly on the variante schema?
  id: string;
  // TODO: should we expose these internal fields?
  // __deleted: boolean;
  // __version: string;
};

export type EntityWithRelation<S extends AnyNoContext> = Entity<S> & {
  _relation: { id: string } | undefined;
};

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

export type EntityBooleanFilter = {
  is: boolean;
};

export type EntityNumberFilter = {
  is?: number;
  greaterThan?: number;
  lessThan?: number;
  not?: EntityNumberFilter;
  or?: EntityNumberFilter[];
};

export type EntityStringFilter = {
  is?: string;
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  not?: EntityStringFilter;
  or?: EntityStringFilter[];
};

export type CrossFieldFilter<T> = {
  [K in keyof T]?: EntityFieldFilter<T[K]>;
} & {
  or?: Array<CrossFieldFilter<T>>;
  not?: CrossFieldFilter<T>;
};

export type EntityFieldFilter<T> = {
  is?: T;
  not?: EntityFieldFilter<T>;
  or?: Array<EntityFieldFilter<T>>;
} & (T extends boolean
  ? {
      is?: boolean;
    }
  : T extends number
    ? {
        greaterThan?: number;
        lessThan?: number;
      }
    : T extends string
      ? {
          startsWith?: string;
          endsWith?: string;
          contains?: string;
        }
      : Record<string, never>);

export type EntityFilter<T> = CrossFieldFilter<T>;
