import type * as Schema from 'effect/Schema';

export const isRelationField = (field: Schema.Schema.All | Schema.PropertySignature.All<PropertyKey>) => {
  // TODO: improve this check
  if (field.ast._tag === 'TupleType') {
    return true;
  }
  return false;
};
