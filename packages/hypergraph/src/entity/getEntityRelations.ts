import type * as Schema from 'effect/Schema';
import { isRelationField } from '../utils/isRelationField.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import type { AnyNoContext, DocumentContent, Entity } from './types.js';
export const getEntityRelations = <const S extends AnyNoContext>(
  entityId: string,
  type: S,
  doc: DocumentContent,
  include: { [K in keyof Schema.Schema.Type<S>]?: Record<string, never> } | undefined,
) => {
  const relations: Record<string, Entity<AnyNoContext>> = {};
  for (const [fieldName, field] of Object.entries(type.fields)) {
    // skip non-relation fields or relations that are not defined in the include object
    if (!isRelationField(field)) continue;

    // Currently we still add an empty array for relations that are not included.
    // This is to ensure that the relation is not undefined in the decoded entity.
    // In the future we might want to derive a schema based on the include object.
    if (!include?.[fieldName]) {
      relations[fieldName] = [];
      continue;
    }

    const relationEntities: Array<Entity<AnyNoContext>> = [];

    for (const [relationId, relation] of Object.entries(doc.relations ?? {})) {
      // @ts-expect-error name is defined
      const typeName = type.name;

      if (relation.fromTypeName !== typeName || relation.fromPropertyName !== fieldName || relation.from !== entityId)
        continue;

      if (relation.__deleted) continue;

      const relationEntity = doc.entities?.[relation.to];
      if (!hasValidTypesProperty(relationEntity)) continue;

      relationEntities.push({ ...relationEntity, id: relation.to, _relation: { id: relationId } });
    }

    relations[fieldName] = relationEntities;
  }

  return relations;
};
