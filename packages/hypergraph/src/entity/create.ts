import type { DocHandle } from '@automerge/automerge-repo';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { PropertyIdSymbol } from '../constants.js';
import { generateId } from '../utils/generateId.js';
import { isRelation } from '../utils/isRelation.js';
import { encodeToGrc20Json } from './entity.js';
import { findOne } from './findOne.js';
import type { DocumentContent, DocumentRelation, Entity } from './types.js';

/**
 * Type utility to transform relation fields to accept string arrays or be omitted entirely.
 * This specifically targets Type.Relation fields which are arrays of objects.
 */
type RelationArrayKeys<T> = {
  // For each property K in T, check if it's an array of objects (relation fields)
  [K in keyof T]: T[K] extends readonly (infer U)[] // Check for readonly arrays
    ? U extends object // If array element is an object
      ? K // Return the property key K
      : never
    : T[K] extends (infer U)[] // Check for mutable arrays
      ? U extends object // If array element is an object
        ? K // Return the property key K
        : never
      : never; // Not an array of objects, so exclude
}[keyof T]; // Extract the union of all matching property keys

type WithRelationsAsStringArrays<T> = Omit<T, RelationArrayKeys<T>> &
  Partial<Record<RelationArrayKeys<T>, string[] | undefined>>;

export const create = <const S extends Schema.Schema.AnyNoContext>(handle: DocHandle<DocumentContent>, type: S) => {
  return (data: Readonly<WithRelationsAsStringArrays<Schema.Schema.Type<S>>>): Entity<S> => {
    const entityId = generateId();
    const encoded = encodeToGrc20Json(type, { ...data, id: entityId });

    const relations: Record<string, DocumentRelation> = {};

    const ast = type.ast as SchemaAST.TypeLiteral;

    for (const prop of ast.propertySignatures) {
      const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);
      if (Option.isSome(result) && isRelation(prop.type)) {
        if (encoded[result.value]) {
          for (const toEntityId of encoded[result.value] as string[]) {
            const relationId = generateId();
            relations[relationId] = {
              from: entityId,
              to: toEntityId as string,
              fromPropertyId: result.value,
              __deleted: false,
            };
          }
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

    return findOne(handle, type)(entityId) as Entity<S>;
  };
};
