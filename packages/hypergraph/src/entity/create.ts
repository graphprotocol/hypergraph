import type { DocHandle } from '@automerge/automerge-repo';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { generateId } from '../utils/generateId.js';
import { isRelation } from '../utils/isRelation.js';
import { isRelationField } from '../utils/isRelationField.js';
import { encodeToGrc20Json } from './entity-new.js';
import { findOne, findOneNew } from './findOne.js';
import { PropertyIdSymbol } from './internal-new.js';
import type { AnyNoContext, DocumentContent, DocumentRelation, Entity, EntityNew, Insert } from './types.js';

/**
 * Type utility to transform relation fields to accept string arrays instead of their typed values
 * This specifically targets TypeNew.Relation fields which are arrays of objects
 */
type WithRelationsAsStringArrays<T> = {
  [K in keyof T]: T[K] extends readonly (infer U)[]
    ? U extends object
      ? string[]
      : T[K]
    : T[K] extends (infer U)[]
      ? U extends object
        ? string[]
        : T[K]
      : T[K];
};

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

export const createNew = <const S extends Schema.Schema.AnyNoContext>(handle: DocHandle<DocumentContent>, type: S) => {
  return (data: Readonly<WithRelationsAsStringArrays<Schema.Schema.Type<S>>>): EntityNew<S> => {
    const entityId = generateId();
    const encoded = encodeToGrc20Json(type, { ...data, id: entityId });

    const relations: Record<string, DocumentRelation> = {};

    const ast = type.ast as SchemaAST.TypeLiteral;

    for (const prop of ast.propertySignatures) {
      const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);
      if (Option.isSome(result) && isRelation(prop.type)) {
        const relationId = generateId();
        for (const toEntityId of encoded[result.value] as string[]) {
          relations[relationId] = {
            from: entityId,
            to: toEntityId as string,
            fromPropertyId: result.value,
            __deleted: false,
          };
        }
        delete encoded[result.value];
      }
    }

    handle.change((doc) => {
      doc.entities ??= {};
      doc.entities[entityId] = {
        ...encoded,
        __deleted: false,
      };
      doc.relations ??= {};
      // merge relations with existing relations
      for (const [relationId, relation] of Object.entries(relations)) {
        doc.relations[relationId] = relation;
      }
    });

    return findOneNew(handle, type)(entityId) as EntityNew<S>;
  };
};
