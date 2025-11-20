import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import {
  PropertyIdSymbol,
  PropertyTypeSymbol,
  RelationBacklinkSymbol,
  RelationPropertiesSymbol,
  RelationSchemaSymbol,
  RelationSymbol,
  TypeIdsSymbol,
} from '../constants.js';

type SchemaBuilderReturn =
  | Schema.Schema.AnyNoContext
  // biome-ignore lint/suspicious/noExplicitAny: effect schema property signature is intentionally untyped here
  | Schema.PropertySignature<any, any, any, any, any, any, any>;

// biome-ignore lint/suspicious/noExplicitAny: property builders accept property ids of varying shapes
type SchemaBuilder = (propertyId: any) => SchemaBuilderReturn;

type RelationPropertiesDefinition = Record<string, SchemaBuilder>;

type RelationOptionsBase = {
  backlink?: boolean;
};

type RelationOptions<RP extends RelationPropertiesDefinition> = RelationOptionsBase & {
  properties: RP;
};

export const relationSchemaBrand = '__hypergraphRelationSchema' as const;
type RelationSchemaMarker = {
  readonly [relationSchemaBrand]: true;
};

export const relationBuilderBrand = '__hypergraphRelationBuilder' as const;
type RelationBuilderMarker = {
  readonly [relationBuilderBrand]: true;
};

const hasRelationProperties = (
  options: RelationOptionsBase | RelationOptions<RelationPropertiesDefinition> | undefined,
): options is RelationOptions<RelationPropertiesDefinition> => {
  if (!options) return false;
  return 'properties' in options;
};

type RelationMappingInput<RP extends RelationPropertiesDefinition | undefined> = RP extends RelationPropertiesDefinition
  ? {
      propertyId: string;
      properties: {
        [K in keyof RP]: Parameters<RP[K]>[0];
      };
    }
  : string | { propertyId: string };

type RelationPropertyValue<RP extends RelationPropertiesDefinition | undefined> =
  RP extends RelationPropertiesDefinition
    ? {
        readonly [K in keyof RP]: Schema.Schema.Type<ReturnType<RP[K]>>;
      }
    : Record<string, never>;

type RelationPropertyEncoded<RP extends RelationPropertiesDefinition | undefined> =
  RP extends RelationPropertiesDefinition
    ? {
        readonly [K in keyof RP]: Schema.Schema.Encoded<ReturnType<RP[K]>>;
      }
    : Record<string, never>;

type RelationMetadata<RP extends RelationPropertiesDefinition | undefined> = {
  readonly id: string;
} & RelationPropertyValue<RP>;

type RelationMetadataEncoded<RP extends RelationPropertiesDefinition | undefined> = {
  readonly id: string;
} & RelationPropertyEncoded<RP>;

type RelationSchema<
  S extends Schema.Schema.AnyNoContext,
  RP extends RelationPropertiesDefinition | undefined = undefined,
> = Schema.Schema<
  readonly (Schema.Schema.Type<S> & { readonly id: string; readonly _relation: RelationMetadata<RP> })[],
  readonly (Schema.Schema.Encoded<S> & { readonly id: string; readonly _relation: RelationMetadataEncoded<RP> })[],
  never
> &
  RelationSchemaMarker;

type RelationSchemaBuilder<
  S extends Schema.Schema.AnyNoContext,
  RP extends RelationPropertiesDefinition | undefined = undefined,
> = ((mapping: RelationMappingInput<RP>) => RelationSchema<S, RP>) & RelationBuilderMarker;

export type AnyRelationSchema =
  // biome-ignore lint/suspicious/noExplicitAny: relation schema branding requires broad typing
  | (Schema.Schema<any, any, any> & RelationSchemaMarker)
  // biome-ignore lint/suspicious/noExplicitAny: relation schema branding requires broad typing
  | (Schema.PropertySignature<any, any, any, any, any, any, any> & RelationSchemaMarker);

export type AnyRelationBuilder = RelationSchemaBuilder<
  Schema.Schema.AnyNoContext,
  RelationPropertiesDefinition | undefined
>;

/**
 * Creates a String schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const String = (propertyId: string) => {
  return Schema.String.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'string' }));
};

/**
 * Creates a Number schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Number = (propertyId: string) => {
  return Schema.Number.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'number' }));
};

/**
 * Creates a Boolean schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Boolean = (propertyId: string) => {
  return Schema.Boolean.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'boolean' }));
};

/**
 * Creates a Date schema with the specified GRC-20 property ID
 */
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Date = (propertyId: string) => {
  return Schema.Date.pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'date' }));
};

export const Point = (propertyId: string) =>
  Schema.transform(Schema.String, Schema.Array(Schema.Number), {
    strict: true,
    decode: (str: string) => {
      return str.split(',').map((n: string) => globalThis.Number(n));
    },
    encode: (points: readonly number[]) => points.join(','),
  }).pipe(Schema.annotations({ [PropertyIdSymbol]: propertyId, [PropertyTypeSymbol]: 'point' }));

export function Relation<S extends Schema.Schema.AnyNoContext>(
  schema: S,
  options?: RelationOptionsBase,
): RelationSchemaBuilder<S, undefined>;
export function Relation<S extends Schema.Schema.AnyNoContext, RP extends RelationPropertiesDefinition>(
  schema: S,
  options: RelationOptions<RP>,
): RelationSchemaBuilder<S, RP>;
export function Relation<
  S extends Schema.Schema.AnyNoContext,
  RP extends RelationPropertiesDefinition | undefined = undefined,
  // biome-ignore lint/suspicious/noExplicitAny: implementation signature for overloads must use any
>(schema: S, options?: RP extends RelationPropertiesDefinition ? RelationOptions<RP> : RelationOptionsBase): any {
  return (mapping: RelationMappingInput<RP>) => {
    const { propertyId, relationPropertyIds } =
      typeof mapping === 'string'
        ? { propertyId: mapping, relationPropertyIds: undefined as undefined }
        : typeof mapping === 'object' && mapping !== null && 'properties' in mapping
          ? { propertyId: mapping.propertyId, relationPropertyIds: mapping.properties }
          : { propertyId: mapping.propertyId, relationPropertyIds: undefined as undefined };

    const typeIds = SchemaAST.getAnnotation<string[]>(TypeIdsSymbol)(schema.ast as SchemaAST.TypeLiteral).pipe(
      Option.getOrElse(() => []),
    );

    const relationEntityPropertiesSchemas: Record<string, SchemaBuilderReturn> = {};

    const normalizedOptions = options as
      | RelationOptionsBase
      | RelationOptions<RelationPropertiesDefinition>
      | undefined;

    const relationProperties = hasRelationProperties(normalizedOptions) ? normalizedOptions.properties : undefined;

    if (relationProperties) {
      for (const [key, schemaType] of Object.entries(relationProperties)) {
        const propertyMapping = relationPropertyIds?.[key];
        relationEntityPropertiesSchemas[key] = schemaType(propertyMapping);
      }
    }

    const relationEntitySchemaStruct = Schema.Struct({
      ...relationEntityPropertiesSchemas,
    });

    const schemaWithId = Schema.asSchema(
      Schema.extend(schema)(
        Schema.Struct({
          id: Schema.String,
          _relation: Schema.extend(relationEntitySchemaStruct)(
            Schema.Struct({
              id: Schema.String,
            }),
          ),
        }),
      ),
      // manually adding the type ids to the schema since they get lost when extending the schema
    ).pipe(
      Schema.annotations({
        [TypeIdsSymbol]: typeIds,
        [RelationPropertiesSymbol]: relationEntitySchemaStruct,
      }),
    ) as Schema.Schema<
      Schema.Schema.Type<S> & { readonly id: string; readonly _relation: RelationMetadata<RP> },
      Schema.Schema.Encoded<S> & { readonly id: string; readonly _relation: RelationMetadataEncoded<RP> },
      never
    >;

    const isBacklinkRelation = !!normalizedOptions?.backlink;

    const relationSchema = Schema.Array(schemaWithId).pipe(
      Schema.annotations({
        [PropertyIdSymbol]: propertyId,
        [RelationSchemaSymbol]: schema,
        [RelationSymbol]: true,
        [PropertyTypeSymbol]: 'relation',
        [RelationBacklinkSymbol]: isBacklinkRelation,
      }),
    );

    Object.defineProperty(relationSchema, relationSchemaBrand, {
      value: true,
      enumerable: false,
      configurable: false,
    });

    return relationSchema as unknown as RelationSchema<S, RP>;
  };
}

export function Backlink<
  S extends Schema.Schema.AnyNoContext,
  RP extends RelationPropertiesDefinition | undefined = undefined,
>(schema: S, options?: RP extends RelationPropertiesDefinition ? RelationOptions<RP> : RelationOptionsBase) {
  const normalizedOptions = {
    ...(options ?? {}),
    backlink: true,
  } as RP extends RelationPropertiesDefinition ? RelationOptions<RP> : RelationOptionsBase;
  return Relation(schema, normalizedOptions);
}

export const optional =
  <S extends Schema.Schema.AnyNoContext>(schemaFn: (propertyId: string) => S) =>
  (propertyId: string) => {
    const innerSchema = schemaFn(propertyId);
    const optionalSchema = Schema.optional(innerSchema);
    if (relationSchemaBrand in (innerSchema as object)) {
      Object.defineProperty(optionalSchema, relationSchemaBrand, {
        value: true,
        enumerable: false,
        configurable: false,
      });
    }
    return optionalSchema as typeof optionalSchema & RelationSchemaMarker;
  };
