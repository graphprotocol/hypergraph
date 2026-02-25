import { Constants } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import * as SchemaAST from 'effect/SchemaAST';

export type OrderByDataType = 'text' | 'boolean' | 'float' | 'datetime' | 'point' | 'schedule';

const ORDER_BY_DATA_TYPE_BY_PROPERTY_TYPE: Record<string, OrderByDataType | undefined> = {
  string: 'text',
  boolean: 'boolean',
  number: 'float',
  date: 'datetime',
  point: 'point',
  schedule: 'schedule',
  relation: undefined,
};

export const getOrderByDataType = (type: SchemaAST.AST): OrderByDataType | undefined => {
  const propertyType = SchemaAST.getAnnotation<string>(Constants.PropertyTypeSymbol)(type);
  if (Option.isSome(propertyType)) {
    return ORDER_BY_DATA_TYPE_BY_PROPERTY_TYPE[propertyType.value];
  }

  if (SchemaAST.isStringKeyword(type)) {
    return 'text';
  }
  if (SchemaAST.isBooleanKeyword(type)) {
    return 'boolean';
  }
  if (SchemaAST.isNumberKeyword(type)) {
    return 'float';
  }

  return undefined;
};

export const convertPropertyValue = (
  property: {
    propertyId: string;
    text: string;
    boolean: boolean;
    float: number;
    datetime: string;
    point: string;
    schedule: string;
  },
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
      if (property.datetime != null) {
        return property.datetime;
      }
      if (property.text != null) {
        return property.text;
      }
      return undefined;
    }
    if (propertyType.value === 'schedule') {
      if (property.schedule != null) {
        return property.schedule;
      }
      if (property.text != null) {
        return property.text;
      }
      return undefined;
    }
  }
};
