import { PropertyTypeSymbol } from '@graphprotocol/hypergraph/constants';
import * as Option from 'effect/Option';
import * as SchemaAST from 'effect/SchemaAST';

export const convertPropertyValue = (
  property: { propertyId: string; string: string; boolean: boolean; number: number; time: string; point: string },
  type: SchemaAST.AST,
) => {
  const propertyType = SchemaAST.getAnnotation<string>(PropertyTypeSymbol)(type);
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
      return Number(property.number);
    }
    if (propertyType.value === 'date') {
      return property.time;
    }
  }
};
