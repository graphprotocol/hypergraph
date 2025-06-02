import type { DocHandle } from '@automerge/automerge-repo';
import * as Schema from 'effect/Schema';
import { generateId } from '../utils/generateId.js';
import { isRelationField } from '../utils/isRelationField.js';
import { findOne } from './findOne.js';
import type { AnyNoContext, DocumentContent, DocumentRelation, Entity, Insert } from './types.js';

/**
 * Creates an entity model of given type and stores it in the repo.
 */
export const create = <const S extends AnyNoContext>(handle: DocHandle<DocumentContent>, type: S) => {
  // TODO: what's the right way to get the name of the type?
  // @ts-expect-error name is defined
  const typeName = type.name;
  const encode = Schema.encodeSync(type.insert);

  return (data: Readonly<Schema.Schema.Type<Insert<S>>>): Entity<S> => {
    const entityId = generateId();
    const encoded = encode(data);

    const relations: Record<string, DocumentRelation> = {};

    for (const [propertyName, field] of Object.entries(type.fields)) {
      if (isRelationField(field) && encoded[propertyName]) {
        for (const toEntityId of encoded[propertyName]) {
          const relationId = generateId();
          relations[relationId] = {
            from: entityId,
            to: toEntityId,
            fromTypeName: typeName,
            fromPropertyName: propertyName,
            __deleted: false,
          };
        }
        // we create the relation object in the repo, so we don't need it in the entity
        delete encoded[propertyName];
      }
    }

    // apply changes to the repo -> adds the entity to the repo entities document
    handle.change((doc) => {
      doc.entities ??= {};
      doc.entities[entityId] = {
        ...encoded,
        '@@types@@': [typeName],
        __deleted: false,
        __version: '',
      };
      doc.relations ??= {};
      // merge relations with existing relations
      for (const [relationId, relation] of Object.entries(relations)) {
        doc.relations[relationId] = relation;
      }
    });

    return findOne(handle, type)(entityId) as Entity<S>;
  };
};
