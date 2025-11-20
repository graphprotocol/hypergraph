import type * as Schema from 'effect/Schema';

type SchemaKey<S extends Schema.Schema.AnyNoContext> = Extract<keyof Schema.Schema.Type<S>, string>;

export type RelationIncludeBranch = {
  [key: string]: RelationIncludeBranch | boolean | undefined;
};

export type EntityInclude<S extends Schema.Schema.AnyNoContext> = Partial<
  Record<SchemaKey<S>, RelationIncludeBranch | boolean>
>;

export type Entity<S extends Schema.Schema.AnyNoContext> = Schema.Schema.Type<S> & {
  id: string;
};

export type EntityWithRelation<S extends Schema.Schema.AnyNoContext> = Entity<S> & {
  _relation:
    | ({
        id: string;
      } & Record<string, unknown>)
    | undefined;
};

export type DocumentEntity = {
  __deleted: boolean;
  [key: string]: unknown;
};

export type DocumentRelation = {
  from: string;
  to: string;
  fromPropertyId: string;
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
};

export type EntityStringFilter = {
  is?: string;
  startsWith?: string;
  endsWith?: string;
  contains?: string;
};

export type CrossFieldFilter<T> = {
  [K in keyof T]?: EntityFieldFilter<T[K]>;
} & {
  or?: Array<CrossFieldFilter<T>>;
  not?: CrossFieldFilter<T>;
};

export type EntityFieldFilter<T> = {
  is?: T;
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
