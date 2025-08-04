import { Schema } from 'effect';

import * as Mapping from '../../mapping/Mapping.js';
import * as Utils from '../../mapping/Utils.js';

export const TypesyncHypergraphSchemaStatus = Schema.NullOr(Schema.Literal('published', 'synced'));
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
