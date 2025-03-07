import type { DocHandle } from '@automerge/automerge-repo';
import * as Schema from 'effect/Schema';
import { generateId } from '../utils/generateId.js';
import type { AnyNoContext, DocumentContent, Entity, Insert } from './types.js';

/**
 * Creates an entity model of given type and stores it in the repo.
 */
export const create = <const S extends AnyNoContext>(handle: DocHandle<DocumentContent>, type: S) => {
  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;
  const entityId = generateId();
  const encode = Schema.encodeSync(type.insert);

  return (data: Readonly<Schema.Schema.Type<Insert<S>>>): Entity<S> => {
    const encoded = encode(data);
    // apply changes to the repo -> adds the entity to the repo entities document
    handle.change((doc) => {
      doc.entities ??= {};
      doc.entities[entityId] = { ...encoded, '@@types@@': [typeName] };
    });

    return { id: entityId, ...encoded, type: typeName };
  };
};
