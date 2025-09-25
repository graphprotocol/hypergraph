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
 * const User = Entity({
 *   name: Type.String,
 *   age: Type.Number,
 * }, {
 *   name: "grc-20-name",
 *   age: "grc-20-age"
 * });
 * ```
 */
export function Entity<
  T extends Record<string, (propertyId: string) => Schema.Schema<any>>,
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
  const properties: Record<string, Schema.Schema<any>> = {};

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
    const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);
    if (Option.isSome(result)) {
      out[result.value] = (value as any)[prop.name];
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
    const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);
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
