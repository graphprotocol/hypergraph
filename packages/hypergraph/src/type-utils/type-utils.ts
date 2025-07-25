import * as Type from '../type/type.js';

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isStringOrOptionalStringType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type === Type.Text;
  }
  return type === Type.Text;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isNumberOrOptionalNumberType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type === Type.Number;
  }
  return type === Type.Number;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isDateOrOptionalDateType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type === Type.Date;
  }
  return type === Type.Date;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isCheckboxOrOptionalCheckboxType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type === Type.Checkbox;
  }
  return type === Type.Checkbox;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isPointOrOptionalPointType = (type: any) => {
  if (type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional) {
    return type === Type.Point;
  }
  return type === Type.Point;
};

// biome-ignore lint/suspicious/noExplicitAny: TODO
export const isOptional = (type: any) => {
  return type.ast && type.ast._tag === 'PropertySignatureDeclaration' && type.ast.isOptional;
};
