import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { PropertyIdSymbol, RelationSchemaSymbol } from '../constants.js';
import { isRelation } from '../utils/isRelation.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import { decodeFromGrc20Json } from './schema.js';
import type { DocumentContent, Entity, EntityInclude } from './types.js';

export const getEntityRelations = <const S extends Schema.Schema.AnyNoContext>(
  entityId: string,
  type: S,
  doc: DocumentContent,
  include: EntityInclude<S> | undefined,
) => {
  const relations: Record<string, Entity<Schema.Schema.AnyNoContext>> = {};
  const ast = type.ast as SchemaAST.TypeLiteral;

  for (const prop of ast.propertySignatures) {
    if (!isRelation(prop.type)) continue;

    const fieldName = String(prop.name);
    const includeNodes = Boolean(include?.[fieldName]);
    const includeTotalCount = Boolean(include?.[`${fieldName}TotalCount`]);

    if (!includeNodes && !includeTotalCount) {
      relations[fieldName] = [];
      continue;
    }

    const relationEntities: Array<Entity<Schema.Schema.AnyNoContext>> = [];

    let relationCount = 0;

    for (const [relationId, relation] of Object.entries(doc.relations ?? {})) {
      const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);
      const schema = SchemaAST.getAnnotation<Schema.Schema.AnyNoContext>(RelationSchemaSymbol)(prop.type);
      if (Option.isSome(result) && Option.isSome(schema)) {
        if (relation.fromPropertyId !== result.value || relation.from !== entityId) continue;
        if (relation.__deleted) continue;

        const relationEntity = doc.entities?.[relation.to];
        const decodedRelationEntity = { ...decodeFromGrc20Json(schema.value, { ...relationEntity, id: relation.to }) };
        if (!hasValidTypesProperty(relationEntity)) continue;

        relationCount += 1;
        if (includeNodes) {
          relationEntities.push({ ...decodedRelationEntity, id: relation.to, _relation: { id: relationId } });
        }
      }
    }
    const relationList = (includeNodes ? relationEntities : []) as Array<Entity<Schema.Schema.AnyNoContext>> & {
      totalCount?: number;
    };

    if (includeTotalCount) {
      relationList.totalCount = relationCount;
    }

    relations[String(prop.name)] = relationList;
  }

  return relations;
};
