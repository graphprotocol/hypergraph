import type { DocHandle } from '@automerge/automerge-repo';
import * as Schema from 'effect/Schema';
import { EntityNotFoundError } from './entity.js';
import type { AnyNoContext, DocumentContent, Entity, Update } from './types.js';

/**
 * Update an existing entity model of given type in the repo.
 */
export const update = <const S extends AnyNoContext>(handle: DocHandle<DocumentContent>, type: S) => {
  const validate = Schema.validateSync(Schema.partial(type.update));
  const encode = Schema.encodeSync(type.update);
  const decode = Schema.decodeUnknownSync(type.update);

  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;

  return (id: string, data: Schema.Simplify<Partial<Schema.Schema.Type<Update<S>>>>): Entity<S> => {
    validate(data);

    // apply changes to the repo -> updates the existing entity to the repo entities document
    let updated: Schema.Schema.Type<S> | undefined = undefined;
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
      updated = { ...decode(entity), ...data };
      doc.entities[id] = { ...encode(updated), '@@types@@': [typeName] };
    });

    if (updated === undefined) {
      throw new EntityNotFoundError({ id, type });
    }

    return { id, type: typeName, ...(updated as Schema.Schema.Type<S>) };
  };
};
