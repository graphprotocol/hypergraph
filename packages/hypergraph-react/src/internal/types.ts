import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export type QueryPublicParams<S extends Entity.AnyNoContext> = {
  enabled: boolean;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
  first?: number;
};
