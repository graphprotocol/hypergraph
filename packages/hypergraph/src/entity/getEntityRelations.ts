import { hasArrayField } from '../utils/hasArrayField.js';
import { isRelationField } from '../utils/isRelationField.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import type { AnyNoContext, DocumentContent, Entity } from './types.js';

export const getEntityRelations = <const S extends AnyNoContext>(
  entity: Entity<AnyNoContext>,
  type: S,
  doc: DocumentContent,
) => {
  const relations: Record<string, Entity<AnyNoContext>> = {};
  for (const [fieldName, field] of Object.entries(type.fields)) {
    if (!isRelationField(field)) continue;

    const relationEntities: Array<Entity<AnyNoContext>> = [];

    if (hasArrayField(entity, fieldName)) {
      for (const relationEntityId of entity[fieldName]) {
        const relationEntity = doc.entities?.[relationEntityId];
        if (!hasValidTypesProperty(relationEntity)) continue;

        relationEntities.push({ ...relationEntity, id: relationEntityId });
      }
    }

    relations[fieldName] = relationEntities;
  }

  return relations;
};
