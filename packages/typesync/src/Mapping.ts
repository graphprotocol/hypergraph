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
export const SchemaDataType = EffectSchema.Union(
  EffectSchema.Literal('Text', 'Number', 'Boolean', 'Date', 'Point', 'Url'),
  SchemaDataTypeRelation,
);
/**
 * @since 0.0.1
 */
export type SchemaDataType = typeof SchemaDataType.Type;

/**
 * Represents the user-built schema object to generate a `Mappings` definition for
 *
 * @since 0.0.1
 */
export const Schema = EffectSchema.Struct({
  types: EffectSchema.Array(
    EffectSchema.Struct({
      name: EffectSchema.NonEmptyTrimmedString,
      knowledgeGraphId: EffectSchema.NullOr(EffectSchema.UUID),
      properties: EffectSchema.Array(
        EffectSchema.Struct({
          name: EffectSchema.NonEmptyTrimmedString,
          knowledgeGraphId: EffectSchema.NullOr(EffectSchema.UUID),
          dataType: SchemaDataType,
        }),
      ).pipe(
        EffectSchema.minItems(1),
        EffectSchema.filter(namesAreUnique, {
          identifier: 'DuplicatePropertyNames',
          jsonSchema: {},
          description: 'The property.name must be unique across all properties in the type',
        }),
      ),
    }),
  ).pipe(
    EffectSchema.minItems(1),
    EffectSchema.filter(namesAreUnique, {
      identifier: 'DuplicateTypeNames',
      jsonSchema: {},
      description: 'The type.name must be unique across all types in the schema',
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
 *
 *
 * @since 0.0.1
 *
 * @param schema user-built and submitted schema
 * @returns the generated [Mapping] definition from the submitted schema
 */
export async function generateMapping(schema: Schema): Promise<Mapping> {
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
          relationValueTypes: [],
          properties: [],
        });
        typePropertyIds.push({ propName: property.name, id });
        ops.push(...createTypePropOp);

        continue;
      }
      const { id, ops: createTypePropOp } = Graph.createProperty({
        name: property.name,
        dataType: mapSchemaDataTypeToGRC20PropDataType(property.dataType),
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

export function mapSchemaDataTypeToGRC20PropDataType(dataType: SchemaDataType): CreatePropertyParams['dataType'] {
  switch (true) {
    case dataType === 'Boolean': {
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
