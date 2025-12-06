import type * as Schema from 'effect/Schema';

type SchemaKey<S extends Schema.Schema.AnyNoContext> = Extract<keyof Schema.Schema.Type<S>, string>;

export type RelationSpacesOverride = 'all' | readonly string[];

export type RelationIncludeConfig = {
  relationSpaces?: RelationSpacesOverride;
  valueSpaces?: RelationSpacesOverride;
};

export type RelationIncludeBranch = {
  _config?: RelationIncludeConfig;
} & {
  [key: string]: RelationIncludeBranch | RelationIncludeConfig | boolean | undefined;
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

export type EntityIdFilter = {
  is?: string;
};

export type CrossFieldFilter<T, Extra extends object = Record<never, never>> = {
  [K in keyof T]?: EntityFieldFilter<T[K]>;
} & Extra & {
    or?: Array<CrossFieldFilter<T, Extra>>;
    not?: CrossFieldFilter<T, Extra>;
  };

type RelationExistsFilter<T> = [T] extends [readonly unknown[] | undefined]
  ? {
      exists?: boolean;
    }
  : Record<never, never>;

type ScalarFieldFilter<T> = [T] extends [readonly unknown[] | undefined]
  ? Record<never, never>
  : T extends boolean
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
        : Record<string, never>;

export type EntityFieldFilter<T> = {
  is?: T;
} & RelationExistsFilter<T> &
  ScalarFieldFilter<T>;

export type EntityFilter<T> = CrossFieldFilter<
  T,
  {
    id?: EntityIdFilter;
  }
>;

export type SpaceSelectionInput =
  | {
      space: string;
      spaces?: never;
    }
  | {
      space?: never;
      spaces: readonly [string, ...string[]];
    }
  | {
      space?: never;
      spaces: 'all';
    };
