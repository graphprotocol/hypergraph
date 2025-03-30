import type { Id as Grc20Id, Op } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export type MappingEntry = {
  typeIds: Grc20Id.Id[];
  properties?: {
    [key: string]: Grc20Id.Id;
  };
  relations?: {
    [key: string]: Grc20Id.Id;
  };
};

export type Mapping = {
  [key: string]: MappingEntry;
};

export type DiffEntry<S extends Entity.AnyNoContext> = Partial<Schema.Schema.Type<Entity.Update<S>>> & {
  id: string;
};

export type EntityLike = {
  id: string;
  [key: string]: unknown;
};

export type DiffEntryLike = {
  id: string;
  [key: string]: unknown;
};

// This is a more flexible version of PublishDiffInfo that can handle mixed entity types
export type PublishDiffInfo = {
  newEntities: Array<{ id: string; entity: EntityLike; ops: Op[] }>;
  deletedEntities: Array<{ id: string; entity: EntityLike; ops: Op[] }>;
  updatedEntities: Array<{
    id: string;
    current: EntityLike;
    next: EntityLike;
    diff: DiffEntryLike;
    ops: Op[];
  }>;
};
