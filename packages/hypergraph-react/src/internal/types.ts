import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export type QueryPublicParams<S extends Schema.Schema.AnyNoContext> = {
  enabled?: boolean | undefined;
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
  space?: string | undefined;
  first?: number | undefined;
  offset?: number | undefined;
  orderBy?:
    | {
        property: keyof Schema.Schema.Type<S>;
        direction: 'asc' | 'desc';
      }
    | undefined;
  backlinksTotalCountsTypeId1?: string | undefined;
};
