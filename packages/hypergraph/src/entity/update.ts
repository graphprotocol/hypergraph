import type { DocHandle } from '@automerge/automerge-repo';
import * as Schema from 'effect/Schema';
import { decodeFromGrc20Json, EntityNotFoundError, encodeToGrc20Json } from './entity.js';
import { findOne } from './findOne.js';
import type { DocumentContent, DocumentEntity, Entity } from './types.js';

/**
 * Update an existing entity model of given type in the repo.
 */
export const update = <const S extends Schema.Schema.AnyNoContext>(handle: DocHandle<DocumentContent>, type: S) => {
  const validate = Schema.validateSync(Schema.partial(type));

  // TODO: what's the right way to get the name of the type?

  return (id: string, data: Schema.Simplify<Partial<Schema.Schema.Type<S>>>): Entity<S> => {
    validate(data);

    // apply changes to the repo -> updates the existing entity to the repo entities document
    let updated: Schema.Schema.Type<S> | undefined;
    handle.change((doc) => {
      if (doc.entities === undefined) {
        return;
      }

      // TODO: Fetch the pre-decoded value from the local cache.
      const entity = doc.entities[id] ?? undefined;
      if (entity === undefined || typeof entity !== 'object') {
        return;
      }

      // TODO: Try to get a diff of the entity properties and only override the changed ones.
      updated = { ...decodeFromGrc20Json(type, entity), ...data };

      const encoded: DocumentEntity = {
        ...encodeToGrc20Json(type, updated),
        __deleted: entity.__deleted ?? false,
      };
      // filter out undefined values otherwise Automerge will throw an error
      for (const key in updated) {
        if (updated[key] === undefined) {
          delete encoded[key];
        }
      }
      doc.entities[id] = encoded;
    });

    if (updated === undefined) {
      throw new EntityNotFoundError({ id, type });
    }

    return findOne(handle, type)(id) as Entity<S>;
  };
};
