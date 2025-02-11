import { hasArrayField } from '../utils/hasArrayField.js';
import type { DocumentContent } from './index.js';
import type { AnyNoContext, Entity } from './types.js';

export const getEntityRelations = <const S extends AnyNoContext>(
  entity: Entity<AnyNoContext>,
  type: S,
  doc: DocumentContent,
) => {
  const relations: Record<string, Entity<AnyNoContext>> = {};
  for (const [fieldName, field] of Object.entries(type.fields)) {
    // TODO: this check is a hack atm, instead check if it is a class instead of specific name
    // TODO: what's the right way to get the name of the type?
    // @ts-expect-error name is defined
    if (field.name !== 'ArrayClass') continue;

    const relationEntities: Array<Entity<AnyNoContext>> = [];

    if (hasArrayField(entity, fieldName)) {
      for (const relationEntityId of entity[fieldName]) {
        const relationEntity = doc.entities?.[relationEntityId];
        if (
          !relationEntity ||
          typeof relationEntity !== 'object' ||
          !('@@types@@' in relationEntity) ||
          !Array.isArray(relationEntity['@@types@@'])
        )
          continue;

        relationEntities.push({ ...relationEntity, id: relationEntityId });
      }
    }

    relations[fieldName] = relationEntities;
  }

  return relations;
};
