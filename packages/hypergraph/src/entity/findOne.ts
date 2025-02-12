import type { DocHandle } from '@automerge/automerge-repo';
import * as Schema from 'effect/Schema';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import type { AnyNoContext, DocumentContent, Entity } from './types.js';

/**
 * Find the entity of the given type, with the given id, from the repo.
 */
export const findOne =
  <const S extends AnyNoContext>(handle: DocHandle<DocumentContent>, type: S) =>
  (id: string): Entity<S> | undefined => {
    const decode = Schema.decodeUnknownSync(type);

    // TODO: what's the right way to get the name of the type?
    // @ts-expect-error name is defined
    const typeName = type.name;

    // TODO: Instead of this insane filtering logic, we should be keeping track of the entities in
    // an index and store the decoded values instead of re-decoding over and over again.
    const entity = handle.docSync()?.entities?.[id];
    if (hasValidTypesProperty(entity) && entity['@@types@@'].includes(typeName)) {
      return { ...decode({ ...entity, id }), type: typeName };
    }

    return undefined;
  };
