import { isRelationField } from '../utils/isRelationField.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import type { AnyNoContext, DocumentContent, Entity } from './types.js';

export const getEntityRelations = <const S extends AnyNoContext>(entityId: string, type: S, doc: DocumentContent) => {
  const relations: Record<string, Entity<AnyNoContext>> = {};
  for (const [fieldName, field] of Object.entries(type.fields)) {
    if (!isRelationField(field)) continue;

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
