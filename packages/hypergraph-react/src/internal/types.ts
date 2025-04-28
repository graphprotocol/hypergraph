import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export type QueryPublicParams<S extends Entity.AnyNoContext> = {
  enabled: boolean;
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, never> } | undefined;
};
