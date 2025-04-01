import type * as Schema from 'effect/Schema';

export const isRelationField = (field: Schema.Schema.All | Schema.PropertySignature.All<PropertyKey>) => {
  // TODO: instead we should check that the field in the array is an Entity.Class
  // @ts-expect-error name is defined
  if (field.name === 'ArrayClass') {
    return true;
  }
  return false;
};
