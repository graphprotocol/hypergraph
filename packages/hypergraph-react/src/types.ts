import type { Id as Grc20Id, Op } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export type Mapping = {
  [key: string]: {
    typeIds: Grc20Id.Id[];
    properties: {
      [key: string]: Grc20Id.Id;
    };
  };
};

export type DiffEntry<S extends Entity.AnyNoContext> = Partial<Schema.Schema.Type<Entity.Update<S>>> & {
  id: string;
};

export type PublishDiffInfo<S extends Entity.AnyNoContext> = {
  newEntities: { id: string; entity: Entity.Entity<S>; ops: Op[] }[];
  deletedEntities: { id: string; entity: Entity.Entity<S>; ops: Op[] }[];
  updatedEntities: { id: string; current: Entity.Entity<S>; next: Entity.Entity<S>; diff: DiffEntry<S>; ops: Op[] }[];
};
