import type { DocHandle } from '@automerge/automerge-repo';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { TypeIdsSymbol } from '../constants.js';
import { decodeFromGrc20Json } from './entity.js';
import { getEntityRelations } from './getEntityRelations.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import type { DocumentContent, Entity } from './types.js';

export const findOne = <const S extends Schema.Schema.AnyNoContext>(
  handle: DocHandle<DocumentContent>,
  type: S,
  include: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined = undefined,
) => {
  return (id: string): Entity<S> | undefined => {
    // TODO: Instead of this insane filtering logic, we should be keeping track of the entities in
    // an index and store the decoded values instead of re-decoding over and over again.
    const doc = handle.doc();
    const entity = doc?.entities?.[id];

    const typeIds = SchemaAST.getAnnotation<string[]>(TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
      Option.getOrElse(() => []),
    );

    const relations = doc ? getEntityRelations(id, type, doc, include) : {};

    if (hasValidTypesProperty(entity) && typeIds.every((typeId) => entity['@@types@@'].includes(typeId))) {
      const decoded = { ...decodeFromGrc20Json(type, { ...entity, id }) };
      // injecting the schema to the entity to be able to access it in the preparePublish function
      decoded.__schema = type;
      return { ...decoded, ...relations };
    }

    return undefined;
  };
};
