import * as Schema from 'effect/Schema';
import { PropertyIdSymbol, RelationSchemaSymbol, RelationSymbol } from './internal-new.js';

/**
 * Creates a String schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const String = (propertyId: string) => {
  return Schema.String.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId }));
};

/**
 * Creates a Number schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Number = (propertyId: string) => {
  return Schema.Number.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId }));
};

/**
 * Creates a Boolean schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Boolean = (propertyId: string) => {
  return Schema.Boolean.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId }));
};

/**
 * Creates a Date schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Date = (propertyId: string) => {
  return Schema.Date.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId }));
};

export const Relation =
  <S extends Schema.Schema.AnyNoContext>(schema: S) =>
  (propertyId: string) => {
    return Schema.Array(schema).pipe(
      Schema.annotations({ [PropertyIdSymbol]: propertyId, [RelationSchemaSymbol]: schema, [RelationSymbol]: true }),
    );
  };
