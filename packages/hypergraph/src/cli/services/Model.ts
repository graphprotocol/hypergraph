import { Schema } from 'effect';

import * as Mapping from '../../mapping/Mapping.js';
import * as Utils from '../../mapping/Utils.js';
import { GeoIdSchema } from '../../utils/geo-id.js';

export const TypesyncHypergraphSchemaStatus = Schema.NullOr(
  Schema.Literal(
    // the type/property has been synced to the schema file and published to the Knowledge Graph
    'published',
    // the type/property has been synced to the schema file, but requires publishing to the Knowledge Graph
    'synced',
    // the type/property exists in the Knowledge Graph, has been added to the users schema through the Typesync UI, but requires syncing to the schema file
    'published_not_synced',
  ),
);
export type TypesyncHypergraphSchemaStatus = typeof TypesyncHypergraphSchemaStatus.Type;

export const TypesyncHypergraphSchemaTypeProperty = Schema.Union(
  Mapping.SchemaTypePropertyPrimitive,
  Mapping.SchemaTypePropertyRelation,
).pipe(
  Schema.extend(
    Schema.Struct({
      status: TypesyncHypergraphSchemaStatus,
    }),
  ),
);
export type TypesyncHypergraphSchemaTypeProperty = typeof TypesyncHypergraphSchemaTypeProperty.Type;
export class TypesyncHypergraphSchemaType extends Schema.Class<TypesyncHypergraphSchemaType>(
  '/Hypergraph/cli/models/TypesyncHypergraphSchemaType',
)({
  ...Mapping.SchemaType.omit('properties').fields,
  status: TypesyncHypergraphSchemaStatus,
  properties: Schema.Array(TypesyncHypergraphSchemaTypeProperty).pipe(
    Schema.minItems(1),
    Schema.filter(Utils.namesAreUnique, {
      identifier: 'DuplicatePropertyNames',
      jsonSchema: {},
      description: 'The property.name must be unique across all properties in the type',
    }),
  ),
}) {}
export class TypesyncHypergraphSchema extends Schema.Class<TypesyncHypergraphSchema>(
  '/Hypergraph/cli/models/TypesyncHypergraphSchema',
)({
  types: Schema.Array(TypesyncHypergraphSchemaType).pipe(
    Schema.minItems(1),
    Schema.filter(Utils.namesAreUnique, {
      identifier: 'DuplicateTypeNames',
      jsonSchema: {},
      description: 'The type.name must be unique across all types in the schema',
    }),
    Schema.filter(Mapping.allRelationPropertyTypesExist, {
      identifier: 'AllRelationTypesExist',
      jsonSchema: {},
      description: 'Each type property of dataType RELATION must have a type of the same name in the schema',
    }),
  ),
}) {}

/**
 * Extending the hypergraph [Mapping definition](../../mapping/Mapping.ts) to make it an effect Schema instance.
 * Allows decoding as well as passing in the api request payload
 */
export const TypesyncHypergraphMapping = Schema.Record({
  key: Schema.NonEmptyTrimmedString,
  value: Schema.Struct({
    typeIds: Schema.Array(GeoIdSchema).pipe(Schema.minItems(1)),
    properties: Schema.optional(
      Schema.UndefinedOr(
        Schema.Record({
          key: Schema.NonEmptyTrimmedString,
          value: GeoIdSchema,
        }),
      ),
    ),
    relations: Schema.optional(
      Schema.UndefinedOr(
        Schema.Record({
          key: Schema.NonEmptyTrimmedString,
          value: GeoIdSchema,
        }),
      ),
    ),
  }),
});
export type TypesyncHypergraphMapping = typeof TypesyncHypergraphMapping.Type;
