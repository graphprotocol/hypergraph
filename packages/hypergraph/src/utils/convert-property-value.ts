import { Constants } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import * as SchemaAST from 'effect/SchemaAST';

export const convertPropertyValue = (
  property: { propertyId: string; string: string; boolean: boolean; number: number; time: string; point: string },
  type: SchemaAST.AST,
) => {
  const propertyType = SchemaAST.getAnnotation<string>(Constants.PropertyTypeSymbol)(type);
  if (Option.isSome(propertyType)) {
    if (propertyType.value === 'string') {
      return property.string;
    }
    if (propertyType.value === 'boolean') {
      return Boolean(property.boolean);
    }
    if (propertyType.value === 'point') {
      return property.point;
    }
    if (propertyType.value === 'number') {
      // Handle case where number is stored as string in the API
      if (property.number != null) {
        return Number(property.number);
      }
      if (property.string != null) {
        return Number(property.string);
      }
      return undefined;
    }
    if (propertyType.value === 'date') {
      return property.time;
    }
  }
};
