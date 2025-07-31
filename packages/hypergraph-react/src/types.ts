import type { Op } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type EntityLike = {
  id: string;
  [key: string]: unknown;
};

export type PartialEntity<S extends Entity.AnyNoContext> = Partial<Schema.Schema.Type<Entity.Update<S>>> & {
  id: string;
};

export type DiffEntry = {
  [key: string]:
    | {
        type: 'relation';
        current: { id: string; name: string }[];
        new: { id: string; name: string }[];
        addedIds: string[];
        removedIds: string[];
        unchangedIds: string[];
      }
    | {
        type: 'property';
        current: unknown;
        new: unknown;
      }
    | undefined;
};

// This is a more flexible version of PublishDiffInfo that can handle mixed entity types
export type PublishDiffInfo = {
  newEntities: Array<{ id: string; entity: EntityLike; ops: Op[] }>;
  deletedEntities: Array<{ id: string; entity: EntityLike; ops: Op[] }>;
  updatedEntities: Array<{
    id: string;
    current: EntityLike;
    new: EntityLike;
    diff: DiffEntry;
    ops: Op[];
  }>;
};
