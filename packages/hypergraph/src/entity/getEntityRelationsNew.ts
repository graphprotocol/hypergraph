import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { PropertyIdSymbol, RelationSchemaSymbol } from '../constants.js';
import { isRelation } from '../utils/isRelation.js';
import { decodeFromGrc20Json } from './entity-new.js';
import type { DocumentContent, EntityNew } from './types.js';
export const getEntityRelationsNew = <const S extends Schema.Schema.AnyNoContext>(
  entityId: string,
  type: S,
  doc: DocumentContent,
  include: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined,
) => {
  const relations: Record<string, EntityNew<Schema.Schema.AnyNoContext>> = {};
  const ast = type.ast as SchemaAST.TypeLiteral;

  for (const prop of ast.propertySignatures) {
    if (!isRelation(prop.type)) continue;

    // TODO: should we add an empty array for relations that are not included?
    // Currently we still add an empty array for relations that are not included.
    // This is to ensure that the relation is not undefined in the decoded entity.
    // In the future we might want to derive a schema based on the include object.
    // if (!include?.[fieldName]) {
    //   relations[fieldName] = [];
    //   continue;
    // }

    const relationEntities: Array<EntityNew<Schema.Schema.AnyNoContext>> = [];

    for (const [relationId, relation] of Object.entries(doc.relations ?? {})) {
      const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);
      const schema = SchemaAST.getAnnotation<Schema.Schema.AnyNoContext>(RelationSchemaSymbol)(prop.type);
      if (Option.isSome(result) && Option.isSome(schema)) {
        if (relation.fromPropertyId !== result.value || relation.from !== entityId) continue;
        if (relation.__deleted) continue;

        const relationEntity = doc.entities?.[relation.to];
        const decodedRelationEntity = { ...decodeFromGrc20Json(schema.value, { ...relationEntity, id: relation.to }) };
        // TODO: should we check if the relation entity is valid?
        // if (!hasValidTypesProperty(relationEntity)) continue;

        relationEntities.push({ ...decodedRelationEntity, id: relation.to, _relation: { id: relationId } });
      }
    }
    relations[prop.name] = relationEntities;
  }

  return relations;
};
