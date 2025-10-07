import * as Data from 'effect/Data';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { PropertyIdSymbol, TypeIdsSymbol } from '../constants.js';

/**
 * Entity function for creating schemas with a nicer API.
 * Takes a schema configuration object and a property ID mapping object.
 *
 * @example
 * ```typescript
 * const User = EntityDefinition({
 *   name: Type.String,
 *   age: Type.Number,
 * }, {
 *   name: "grc-20-name",
 *   age: "grc-20-age"
 * });
 * ```
 */
export function EntitySchema<
  T extends Record<
    string,
    (propertyId: string) => Schema.Schema<any> | Schema.PropertySignature<any, any, any, any, any, any, any>
  >,
  P extends Record<keyof T, string>,
>(
  schemaTypes: T,
  mapping: {
    types: Array<string>;
    properties: P;
  },
): Schema.Struct<{
  [K in keyof T]: ReturnType<T[K]> & { id: string };
}> {
  const properties: Record<string, Schema.Schema<any> | Schema.PropertySignature<any, any, any, any, any, any, any>> =
    {};

  for (const [key, schemaType] of Object.entries(schemaTypes)) {
    const propertyId = mapping.properties[key as keyof P];
    properties[key] = schemaType(propertyId);
  }

  return Schema.Struct(properties).pipe(Schema.annotations({ [TypeIdsSymbol]: mapping.types })) as any;
}

export function encodeToGrc20Json<T extends object, E>(schema: Schema.Schema<T, E>, value: T): Record<string, unknown> {
  const ast = schema.ast as SchemaAST.TypeLiteral;
  const out: Record<string, unknown> = {};

  for (const prop of ast.propertySignatures) {
    const propType =
      prop.isOptional && SchemaAST.isUnion(prop.type)
        ? (prop.type.types.find((member) => !SchemaAST.isUndefinedKeyword(member)) ?? prop.type)
        : prop.type;
    const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(propType);
    const propertyValue: any = (value as any)[prop.name];
    if (Option.isSome(result) && propertyValue !== undefined) {
      out[result.value] = propertyValue;
    }
  }

  const typeIds = SchemaAST.getAnnotation<string[]>(TypeIdsSymbol)(ast).pipe(Option.getOrElse(() => []));
  out['@@types@@'] = typeIds;

  return out;
}

export function decodeFromGrc20Json<T extends object, E>(
  schema: Schema.Schema<T, E>,
  grc20Data: Record<string, unknown>,
): T {
  const ast = schema.ast as SchemaAST.TypeLiteral;
  const out: Record<string, unknown> = {};

  for (const prop of ast.propertySignatures) {
    const propType =
      prop.isOptional && SchemaAST.isUnion(prop.type)
        ? (prop.type.types.find((member) => !SchemaAST.isUndefinedKeyword(member)) ?? prop.type)
        : prop.type;
    const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(propType);
    if (Option.isSome(result)) {
      const grc20Key = result.value;
      if (grc20Key in grc20Data && typeof prop.name === 'string') {
        out[prop.name] = (grc20Data as any)[grc20Key];
      }
    }
  }

  out.id = grc20Data.id as string;

  return out as T;
}

export class EntityNotFoundError extends Data.TaggedError('EntityNotFoundError')<{
  id: string;
  type: Schema.Schema.AnyNoContext;
  cause?: unknown;
}> {}
