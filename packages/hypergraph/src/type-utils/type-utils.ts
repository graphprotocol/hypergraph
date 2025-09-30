import * as Type from '../type/type.js';

export const isStringType = (type: any) => {
  return type === Type.String;
};

export const isNumberType = (type: any) => {
  return type === Type.Number;
};

export const isDateType = (type: any) => {
  return type === Type.Date;
};

export const isBooleanType = (type: any) => {
  return type === Type.Boolean;
};

export const isPointType = (type: any) => {
  return type === Type.Point;
};
