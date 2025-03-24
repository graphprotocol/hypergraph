'use client';

import type { Entity } from '@graphprotocol/hypergraph';
import type { DiffEntry } from '../../types.js';
import { EntityCard } from './entity-card.js';
import { UpdatedEntityCard } from './updated-entity-card.js';

type PublishDiffProps<S extends Entity.AnyNoContext> = {
  newEntities: Entity.Entity<S>[];
  deletedEntities: Entity.Entity<S>[];
  updatedEntities: {
    id: string;
    current: Entity.Entity<S>;
    next: Entity.Entity<S>;
    diff: DiffEntry<S>;
  }[];
};

export const PublishDiff = <S extends Entity.AnyNoContext>({
  newEntities = [],
  deletedEntities = [],
  updatedEntities = [],
}: PublishDiffProps<S>) => {
  return (
    <div className="space-y-6 text-sm">
      {newEntities.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="New Entities"
            >
              <title>New Entities</title>
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Entities ({newEntities.length})
          </h2>
          <div className="space-y-3">
            {newEntities.map((entity) => (
              <EntityCard<S> key={entity.id} entity={entity} type="new" />
            ))}
          </div>
        </section>
      )}

      {updatedEntities.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">Updated Entities ({updatedEntities.length})</h2>
          <div className="space-y-3">
            {updatedEntities.map((entity) => (
              <UpdatedEntityCard<S> key={entity.id} entity={entity} />
            ))}
          </div>
        </section>
      )}

      {deletedEntities.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Deleted Entities</title>
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            Deleted Entities ({deletedEntities.length})
          </h2>
          <div className="space-y-3">
            {deletedEntities.map((entity) => (
              <EntityCard<S> key={entity.id} entity={entity} type="deleted" />
            ))}
          </div>
        </section>
      )}

      {newEntities.length === 0 && updatedEntities.length === 0 && deletedEntities.length === 0 && (
        <div className="text-center py-6 text-xs text-muted-foreground">No changes detected</div>
      )}
    </div>
  );
};
