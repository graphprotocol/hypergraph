import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export type QueryPublicParams<S extends Schema.Schema.AnyNoContext> = {
  enabled?: boolean | undefined;
} & Entity.FindManyPublicParams<S>;
