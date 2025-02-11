import { hasArrayField } from '../utils/hasArrayField.js';
import { hasValidTypesProperty } from './hasValidTypesProperty.js';
import type { DocumentContent } from './index.js';
import { isReferenceField } from './isReferenceField.js';
import type { AnyNoContext, Entity } from './types.js';

export const getEntityRelations = <const S extends AnyNoContext>(
  entity: Entity<AnyNoContext>,
  type: S,
  doc: DocumentContent,
) => {
  const relations: Record<string, Entity<AnyNoContext>> = {};
  for (const [fieldName, field] of Object.entries(type.fields)) {
    if (!isReferenceField(field)) continue;

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
