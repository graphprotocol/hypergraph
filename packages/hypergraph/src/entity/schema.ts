import * as Data from 'effect/Data';
import * as Option from 'effect/Option';
import * as EffectSchema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { PropertyIdSymbol, TypeIdsSymbol } from '../constants.js';

/**
 * Entity function for creating schemas with a nicer API.
 * Takes a schema configuration object and a property ID mapping object.
 *
 * @example
 * ```typescript
 * const User = Entity.Schema({
 *   name: Type.String,
 *   age: Type.Number,
 * }, {
 *   name: "grc-20-id",
 *   age: "grc-20-id"
 * });
 * ```
 */
export function Schema<
  T extends Record<
    string,
    // biome-ignore lint/suspicious/noExplicitAny: any
    (propertyId: string) => EffectSchema.Schema<any> | EffectSchema.PropertySignature<any, any, any, any, any, any, any>
  >,
  P extends Record<keyof T, string>,
>(
  schemaTypes: T,
  mapping: {
    types: Array<string>;
    properties: P;
  },
): EffectSchema.Struct<{
  [K in keyof T]: ReturnType<T[K]> & { id: string };
}> {
  const properties: Record<
    string,
    // biome-ignore lint/suspicious/noExplicitAny: any
    EffectSchema.Schema<any> | EffectSchema.PropertySignature<any, any, any, any, any, any, any>
  > = {};

  for (const [key, schemaType] of Object.entries(schemaTypes)) {
    const propertyId = mapping.properties[key as keyof P];
    properties[key] = schemaType(propertyId);
  }

  // biome-ignore lint/suspicious/noExplicitAny: any
  return EffectSchema.Struct(properties).pipe(EffectSchema.annotations({ [TypeIdsSymbol]: mapping.types })) as any;
}

export function encodeToGrc20Json<T extends object, E>(
  schema: EffectSchema.Schema<T, E>,
  value: T,
): Record<string, unknown> {
  const ast = schema.ast as SchemaAST.TypeLiteral;
  const out: Record<string, unknown> = {};

  for (const prop of ast.propertySignatures) {
    const propType =
      prop.isOptional && SchemaAST.isUnion(prop.type)
        ? (prop.type.types.find((member) => !SchemaAST.isUndefinedKeyword(member)) ?? prop.type)
        : prop.type;
    const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(propType);
    // biome-ignore lint/suspicious/noExplicitAny: any
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
  schema: EffectSchema.Schema<T, E>,
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
        // biome-ignore lint/suspicious/noExplicitAny: any
        out[prop.name] = (grc20Data as any)[grc20Key];
      }
    }
  }

  out.id = grc20Data.id as string;
  out.__deleted = grc20Data.__deleted ?? false;

  return out as T;
}

export class EntityNotFoundError extends Data.TaggedError('EntityNotFoundError')<{
  id: string;
  type: EffectSchema.Schema.AnyNoContext;
  cause?: unknown;
}> {}
