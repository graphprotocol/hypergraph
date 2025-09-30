import * as Schema from 'effect/Schema';
import { PropertyIdSymbol, PropertyTypeSymbol, RelationSchemaSymbol, RelationSymbol } from '../constants.js';

/**
 * Creates a String schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const String = (propertyId: string) => {
  return Schema.String.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'string' }));
};

/**
 * Creates a Number schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Number = (propertyId: string) => {
  return Schema.Number.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'number' }));
};

/**
 * Creates a Boolean schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Boolean = (propertyId: string) => {
  return Schema.Boolean.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'boolean' }));
};

/**
 * Creates a Date schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Date = (propertyId: string) => {
  return Schema.Date.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'date' }));
};

export const Point = (propertyId: string) =>
  Schema.transform(Schema.String, Schema.Array(Schema.Number), {
    strict: true,
    decode: (str: string) => {
      return str.split(',').map((n: string) => globalThis.Number(n));
    },
    encode: (points: readonly number[]) => points.join(','),
  }).pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'point' }));

export const Relation =
  <S extends Schema.Schema.AnyNoContext>(schema: S) =>
  (propertyId: string) => {
    const schemaWithId = Schema.extend(
      Schema.Struct({ id: Schema.String, _relation: Schema.Struct({ id: Schema.String }) }),
    )(schema);
    return Schema.Array(schemaWithId).pipe(
      Schema.annotations({
        [PropertyIdSymbol]: propertyId,
        [RelationSchemaSymbol]: schema,
        [RelationSymbol]: true,
        [PropertyTypeSymbol]: 'relation',
      }),
    );
  };

export const optional =
  <S extends Schema.Schema.AnyNoContext>(schemaFn: (propertyId: string) => S) =>
  (propertyId: string) => {
    const innerSchema = schemaFn(propertyId);
    return Schema.optional(innerSchema);
  };
