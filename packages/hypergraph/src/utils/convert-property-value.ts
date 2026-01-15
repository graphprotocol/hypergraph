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
      // Handle case where boolean is stored as string in the API
      if (property.boolean != null) {
        return Boolean(property.boolean);
      }
      if (property.string != null && (property.string === '1' || property.string === '0')) {
        return property.string === '1';
      }
      return undefined;
    }
    if (propertyType.value === 'point') {
      // Handle case where point is stored as string in the API
      if (property.point != null) {
        return property.point;
      }
      if (property.string != null) {
        return property.string;
      }
      return undefined;
    }
    if (propertyType.value === 'number') {
      // Handle case where number is stored as string in the API
      if (property.number != null) {
        return Number(property.number);
      }
      if (property.string != null && property.string !== '' && !Number.isNaN(Number(property.string))) {
        return Number(property.string);
      }
      return undefined;
    }
    if (propertyType.value === 'date') {
      // Handle case where date is stored as string in the API
      if (property.time != null) {
        return new Date(property.time);
      }
      if (property.string != null && property.string !== '') {
        return new Date(property.string);
      }
      return undefined;
    }
  }
};
