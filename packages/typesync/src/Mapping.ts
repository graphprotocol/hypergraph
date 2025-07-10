import { type CreatePropertyParams, Graph, Id as Grc20Id, type Op } from '@graphprotocol/grc-20';
import { Array as EffectArray, Schema as EffectSchema, pipe } from 'effect';

import { namesAreUnique, toCamelCase, toPascalCase } from './Utils.js';

/**
 * Mappings for a schema type and its properties/relations
 *
 * @since 0.0.1
 */
export type MappingEntry = {
  /**
   * Array of the `Id.Id` of the type in the Knowledge Graph.
   * Is an array because a type can belong to multiple spaces/extend multiple types.
   *
   * @since 0.0.1
   */
  typeIds: Array<Grc20Id.Id>;
  /**
   * Record of property names to the `Id.Id` of the type in the Knowledge Graph
   *
   * @since 0.0.1
   */
  properties?:
    | {
        [key: string]: Grc20Id.Id;
      }
    | undefined;
};

/**
 * @example
 * ```ts
 * import { Id } from '@graphprotocol/grc-20'
 * import type { Mapping } from '@graphprotocol/typesync'
 *
 * const mapping: Mapping = {
 *   Account: {
 *     typeIds: [Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
 *     properties: {
 *       username: Id.Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
 *       createdAt: Id.Id('64bfba51-a69b-4746-be4b-213214a879fe')
 *     }
 *   },
 *   Event: {
 *     typeIds: [Id.Id('0349187b-526f-435f-b2bb-9e9caf23127a')],
 *     properties: {
 *       name: Id.Id('3808e060-fb4a-4d08-8069-35b8c8a1902b'),
 *       description: Id.Id('1f0d9007-8da2-4b28-ab9f-3bc0709f4837'),
 *       speaker: Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')
 *     },
 *   }
 * }
 * ```
 *
 * @since 0.0.1
 */
export type Mapping = {
  [key: string]: MappingEntry;
};

/**
 * @since 0.0.1
 */
export type DataTypeRelation = `Relation(${string})`;
/**
 * @since 0.0.1
 */
export function isDataTypeRelation(val: string): val is DataTypeRelation {
  return /^Relation\((.+)\)$/.test(val);
}
/**
 * @since 0.0.1
 */
export const SchemaDataTypeRelation = EffectSchema.NonEmptyTrimmedString.pipe(
  EffectSchema.filter((val) => isDataTypeRelation(val)),
);
/**
 * @since 0.0.1
 */
export type SchemaDataTypeRelation = typeof SchemaDataTypeRelation.Type;
/**
 * @since 0.0.1
 */
export const SchemaDataTypePrimitive = EffectSchema.Literal('Text', 'Number', 'Checkbox', 'Date', 'Point', 'Url');
/**
 * @since 0.0.1
 */
export type SchemaDataTypePrimitive = typeof SchemaDataTypePrimitive.Type;
/**
 * @since 0.0.1
 */
export const SchemaDataType = EffectSchema.Union(SchemaDataTypePrimitive, SchemaDataTypeRelation);
/**
 * @since 0.0.1
 */
export type SchemaDataType = typeof SchemaDataType.Type;
/**
 * @since 0.0.1
 */
export const SchemaTypePropertyRelation = EffectSchema.Struct({
  name: EffectSchema.NonEmptyTrimmedString,
  knowledgeGraphId: EffectSchema.NullOr(EffectSchema.UUID),
  dataType: SchemaDataTypeRelation,
  relationType: EffectSchema.NonEmptyTrimmedString.annotations({
    identifier: 'SchemaTypePropertyRelation.relationType',
    description: 'name of the type within the schema that this property is related to',
    examples: ['Account'],
  }),
});
/**
 * @since 0.0.1
 */
export type SchemaTypePropertyRelation = typeof SchemaTypePropertyRelation.Type;
/**
 * @since 0.0.1
 */
export const SchemaTypePropertyPrimitive = EffectSchema.Struct({
  name: EffectSchema.NonEmptyTrimmedString,
  knowledgeGraphId: EffectSchema.NullOr(EffectSchema.UUID),
  dataType: SchemaDataTypePrimitive,
});
/**
 * @since 0.0.1
 */
export type SchemaTypePropertyPrimitive = typeof SchemaTypePropertyPrimitive.Type;

/**
 * @since 0.0.1
 */
export function propertyIsRelation(
  property: SchemaTypePropertyPrimitive | SchemaTypePropertyRelation,
): property is SchemaTypePropertyRelation {
  return isDataTypeRelation(property.dataType);
}

/**
 * @since 0.0.1
 */
export const SchemaType = EffectSchema.Struct({
  name: EffectSchema.NonEmptyTrimmedString,
  knowledgeGraphId: EffectSchema.NullOr(EffectSchema.UUID),
  properties: EffectSchema.Array(EffectSchema.Union(SchemaTypePropertyPrimitive, SchemaTypePropertyRelation)).pipe(
    EffectSchema.minItems(1),
    EffectSchema.filter(namesAreUnique, {
      identifier: 'DuplicatePropertyNames',
      jsonSchema: {},
      description: 'The property.name must be unique across all properties in the type',
    }),
  ),
});
/**
 * @since 0.0.1
 */
export type SchemaType = typeof SchemaType.Type;

/**
 * Represents the user-built schema object to generate a `Mappings` definition for
 *
 * @since 0.0.1
 */
export const Schema = EffectSchema.Struct({
  types: EffectSchema.Array(SchemaType).pipe(
    EffectSchema.minItems(1),
    EffectSchema.filter(namesAreUnique, {
      identifier: 'DuplicateTypeNames',
      jsonSchema: {},
      description: 'The type.name must be unique across all types in the schema',
    }),
    EffectSchema.filter(allRelationPropertyTypesExist, {
      identifier: 'AllRelationTypesExist',
      jsonSchema: {},
      description: 'Each type property of dataType RELATION must have a type of the same name in the schema',
    }),
  ),
}).annotations({
  identifier: 'typesync/Schema',
  title: 'TypeSync app Schema',
  description: 'An array of types in the schema defined by the user to generate a Mapping object for',
  examples: [
    {
      types: [
        {
          name: 'Account',
          knowledgeGraphId: null,
          properties: [{ name: 'username', knowledgeGraphId: null, dataType: 'Text' }],
        },
      ],
    },
    {
      types: [
        {
          name: 'Account',
          knowledgeGraphId: 'a5fd07b1-120f-46c6-b46f-387ef98396a6',
          properties: [{ name: 'name', knowledgeGraphId: 'a126ca53-0c8e-48d5-b888-82c734c38935', dataType: 'Text' }],
        },
      ],
    },
  ],
});
/**
 * @since 0.0.1
 */
export type Schema = typeof Schema.Type;
/**
 * @since 0.0.1
 */
export const SchemaKnownDecoder = EffectSchema.decodeSync(Schema);
/**
 * @since 0.0.1
 */
export const SchemaUnknownDecoder = EffectSchema.decodeUnknownSync(Schema);

/**
 * Iterate through all properties in all types in the schema of `dataType` === `Relation(${string})`
 * and validate that the schema.types have a type for the existing relation
 *
 * @example <caption>All types exist</caption>
 * ```ts
 * import { allRelationPropertyTypesExist, type Mapping } from '@graphprotocol/typesync/Mapping'
 *
 * const types: Mapping['types'] = [
 *   {
 *     name: "Account",
 *     knowledgeGraphId: null,
 *     properties: [
 *       {
 *         name: "username",
 *         dataType: "Text",
 *         knowledgeGraphId: null
 *       }
 *     ]
 *   },
 *   {
 *     name: "Event",
 *     knowledgeGraphId: null,
 *     properties: [
 *       {
 *         name: "speaker",
 *         dataType: "Relation(Account)"
 *         relationType: "Account",
 *         knowledgeGraphId: null,
 *       }
 *     ]
 *   }
 * ]
 * expect(allRelationPropertyTypesExist(types)).toEqual(true)
 * ```
 *
 * @example <caption>Account type is missing</caption>
 * ```ts
 * import { allRelationPropertyTypesExist, type Mapping } from '@graphprotocol/typesync/Mapping'
 *
 * const types: Mapping['types'] = [
 *   {
 *     name: "Event",
 *     knowledgeGraphId: null,
 *     properties: [
 *       {
 *         name: "speaker",
 *         dataType: "Relation(Account)",
 *         relationType: "Account",
 *         knowledgeGraphId: null,
 *       }
 *     ]
 *   }
 * ]
 * expect(allRelationPropertyTypesExist(types)).toEqual(false)
 * ```
 *
 * @since 0.0.1
 *
 * @param types the user-submitted schema types
 */
export function allRelationPropertyTypesExist(types: ReadonlyArray<SchemaType>): boolean {
  const unqTypeNames = EffectArray.reduce(types, new Set<string>(), (names, curr) => names.add(curr.name));
  return pipe(
    types,
    EffectArray.flatMap((curr) => curr.properties),
    EffectArray.filter((prop) => propertyIsRelation(prop)),
    EffectArray.every((prop) => unqTypeNames.has(prop.relationType)),
  );
}

/**
 * Takes the user-submitted schema, validates it, and build the `Mapping` definition for the schema.
 *
 * @since 0.0.1
 *
 * @param input user-built and submitted schema
 * @returns the generated [Mapping] definition from the submitted schema
 */
export async function generateMapping(input: Schema): Promise<Mapping> {
  // validate the schema since the input is the type, but the schema has additional filters against it to validate as well
  const schema = SchemaKnownDecoder(input);

  const entries: Array<MappingEntry & { typeName: string }> = [];
  const ops: Array<Op> = [];

  for (const type of schema.types) {
    const typePropertyIds: Array<{ propName: string; id: Grc20Id.Id }> = [];
    for (const property of type.properties) {
      if (property.knowledgeGraphId) {
        typePropertyIds.push({ propName: property.name, id: Grc20Id.Id(property.knowledgeGraphId) });

        continue;
      }
      // create op for creating type property
      const dataType = mapSchemaDataTypeToGRC20PropDataType(property.dataType);
      if (dataType === 'RELATION') {
        const { id, ops: createTypePropOp } = Graph.createProperty({
          name: property.name,
          dataType: 'RELATION',
          /**
           * @todo fill in the relationValueTypes and properties for creating a relation property
           */
          relationValueTypes: [],
          properties: [],
        });
        typePropertyIds.push({ propName: property.name, id });
        ops.push(...createTypePropOp);

        continue;
      }
      const { id, ops: createTypePropOp } = Graph.createProperty({
        name: property.name,
        dataType,
      });
      typePropertyIds.push({ propName: property.name, id });
      ops.push(...createTypePropOp);
    }

    const properties: MappingEntry['properties'] = pipe(
      typePropertyIds,
      EffectArray.reduce({} as NonNullable<MappingEntry['properties']>, (props, { propName, id }) => {
        props[toCamelCase(propName)] = id;

        return props;
      }),
    );

    if (type.knowledgeGraphId) {
      entries.push({
        typeName: toPascalCase(type.name),
        typeIds: [Grc20Id.Id(type.knowledgeGraphId)],
        properties,
      });
      continue;
    }
    // create the type op, with its properties
    const { id, ops: createTypeOp } = Graph.createType({
      name: type.name,
      properties: EffectArray.map(typePropertyIds, ({ id }) => id),
    });
    ops.push(...createTypeOp);

    entries.push({
      typeName: toPascalCase(type.name),
      typeIds: [id],
      properties,
    });
  }

  /**
   * @todo publish the schema onchain to the Knowledge Graph with hypergraph connect app to the application space
   */

  return pipe(
    entries,
    EffectArray.reduce({} as Mapping, (mapping, entry) => {
      const { typeName, ...rest } = entry;
      mapping[typeName] = rest;

      return mapping;
    }),
  );
}

/**
 * @since 0.0.1
 *
 * @param dataType the dataType from the user-submitted schema
 * @returns the mapped to GRC-20 dataType for the GRC-20 ops
 */
export function mapSchemaDataTypeToGRC20PropDataType(dataType: SchemaDataType): CreatePropertyParams['dataType'] {
  switch (true) {
    case dataType === 'Checkbox': {
      return 'CHECKBOX';
    }
    case dataType === 'Date': {
      return 'TIME';
    }
    case dataType === 'Number': {
      return 'NUMBER';
    }
    case dataType === 'Point': {
      return 'POINT';
    }
    case dataType === 'Url': {
      return 'TEXT';
    }
    case isDataTypeRelation(dataType): {
      return 'RELATION';
    }
    default: {
      return 'TEXT';
    }
  }
}
