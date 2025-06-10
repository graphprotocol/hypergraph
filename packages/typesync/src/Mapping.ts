import { type CreatePropertyParams, Graph, Id as Grc20Id, type Op } from '@graphprotocol/grc-20';
import { Array as EffectArray, Schema as EffectSchema, pipe } from 'effect';

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
  /**
   * Record of schema type relation names to the `Id.Id` of the relation in the Knowledge Graph
   *
   * @since 0.0.1
   */
  relations?:
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
 *     },
 *     relations: {
 *       account: Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')
 *     }
 *   }
 * }
 * ```
 *
 * @since 0.0.1
 */
export type Mapping = {
  [key: string]: MappingEntry;
};

export type DataTypeRelation = `Relation(${string})`;
export function isDataTypeRelation(val: string): val is DataTypeRelation {
  return /^Relation\((.+)\)$/.test(val);
}
export const SchemaDataTypeRelation = EffectSchema.NonEmptyTrimmedString.pipe(
  EffectSchema.filter((val) => isDataTypeRelation(val)),
);
export type SchemaDataTypeRelation = typeof SchemaDataTypeRelation.Type;

export const SchemaDataType = EffectSchema.Union(
  EffectSchema.Literal('Text', 'Number', 'Boolean', 'Date', 'Point', 'Url'),
  SchemaDataTypeRelation,
);
export type SchemaDataType = typeof SchemaDataType.Type;

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
      ).pipe(EffectSchema.minItems(1)),
    }),
  ).pipe(EffectSchema.minItems(1)),
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
export type Schema = typeof Schema.Type;

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
      const { id, ops: createTypePropOp } = Graph.createProperty({
        name: property.name,
        dataType: mapSchemaDataTypeToGRC20PropDataType(property.dataType),
      });
      typePropertyIds.push({ propName: property.name, id });
      // add createProperty ops to array to submit in batch to KG
      ops.push(...createTypePropOp);
    }

    const properties: MappingEntry['properties'] = pipe(
      typePropertyIds,
      EffectArray.reduce({} as NonNullable<MappingEntry['properties']>, (props, { propName, id }) => {
        props[propName] = id;

        return props;
      }),
    );

    const relations: MappingEntry['relations'] = undefined;

    if (type.knowledgeGraphId) {
      entries.push({
        typeName: type.name,
        typeIds: [Grc20Id.Id(type.knowledgeGraphId)],
        properties,
        relations,
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
      typeName: type.name,
      typeIds: [id],
      properties,
      relations,
    });
  }

  // @todo send ops to Knowledge Graph

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
