import { Constants } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import * as SchemaAST from 'effect/SchemaAST';

export const convertPropertyValue = (
  property: { propertyId: string; text: string; boolean: boolean; float: number; time: string; point: string },
  type: SchemaAST.AST,
) => {
  const propertyType = SchemaAST.getAnnotation<string>(Constants.PropertyTypeSymbol)(type);
  if (Option.isSome(propertyType)) {
    if (propertyType.value === 'string') {
      return property.text;
    }
    if (propertyType.value === 'boolean') {
      // Handle case where boolean is stored as string in the API
      if (property.boolean != null) {
        return Boolean(property.boolean);
      }
      if (property.text != null && (property.text === '1' || property.text === '0')) {
        return property.text === '1';
      }
      return undefined;
    }
    if (propertyType.value === 'point') {
      // Handle case where point is stored as string in the API
      if (property.point != null) {
        return property.point;
      }
      if (property.text != null) {
        return property.text;
      }
      return undefined;
    }
    if (propertyType.value === 'number') {
      // Handle case where number is stored as string in the API
      if (property.float != null) {
        return Number(property.float);
      }
      if (property.text != null && property.text !== '' && !Number.isNaN(Number(property.text))) {
        return Number(property.text);
      }
      return undefined;
    }
    if (propertyType.value === 'date') {
      // Handle case where date is stored as string in the API
      if (property.time != null) {
        return property.time;
      }
      if (property.text != null) {
        return property.text;
      }
      return undefined;
    }
  }
};
