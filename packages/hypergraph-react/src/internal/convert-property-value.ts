import { TypeUtils } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

export const convertPropertyValue = (
  property: { propertyId: string; string: string; boolean: boolean; number: number; time: string; point: string },
  key: string,
  type: Schema.Schema.AnyNoContext,
) => {
  if (TypeUtils.isBooleanOrOptionalBooleanType(type.fields[key]) && property.boolean !== undefined) {
    return Boolean(property.boolean);
  }
  if (TypeUtils.isPointOrOptionalPointType(type.fields[key]) && property.point !== undefined) {
    return property.point;
  }
  if (TypeUtils.isDateOrOptionalDateType(type.fields[key]) && property.time !== undefined) {
    return property.time;
  }
  if (TypeUtils.isNumberOrOptionalNumberType(type.fields[key]) && property.number !== undefined) {
    return Number(property.number);
  }
  return property.string;
};
