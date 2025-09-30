import * as Type from '../type/type.js';

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isStringOrOptionalStringType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type.from === Type.String;
  }
  return type === Type.String;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isNumberOrOptionalNumberType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type.from === Type.Number;
  }
  return type === Type.Number;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isDateOrOptionalDateType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type.from === Type.Date;
  }
  return type === Type.Date;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isBooleanOrOptionalBooleanType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type.from === Type.Boolean;
  }
  return type === Type.Boolean;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isPointOrOptionalPointType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type.from === Type.Point;
  }
  return type === Type.Point;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isOptional = (type: any) => {
  return type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional;
};

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
