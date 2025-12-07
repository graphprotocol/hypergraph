import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export type QueryPublicParams<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = boolean | undefined,
> = {
  enabled?: boolean | undefined;
} & Entity.FindManyPublicParams<S, IncludeSpaceIds>;
