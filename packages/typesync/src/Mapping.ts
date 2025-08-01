import { type CreatePropertyParams, Graph, Id as Grc20Id, type Op } from '@graphprotocol/grc-20';
import { Data, Array as EffectArray, Schema as EffectSchema, Option, pipe } from 'effect';

import { namesAreUnique, toCamelCase, toPascalCase } from './Utils.js';

/**
 * Mappings for a schema type and its properties/relations
 *
 * @since 0.0.1
 */
export type MappingEntry = {
  /**
   * Array of the `Id` of the type in the Knowledge Graph.
   * Is an array because a type can belong to multiple spaces/extend multiple types.
   *
   * @since 0.0.1
   */
  typeIds: Array<Grc20Id>;
  /**
   * Record of property names to the `Id` of the type in the Knowledge Graph
   *
   * @since 0.0.1
   */
  properties?:
    | {
        [key: string]: Grc20Id;
      }
    | undefined;
  /**
   * Record of relation properties to the `Id` of the type in the Knowledge Graph
   *
   * @since 0.0.1
   */
  relations?:
    | {
        [key: string]: Grc20Id;
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
 *     typeIds: [Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
 *     properties: {
 *       username: Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
 *       createdAt: Id('64bfba51-a69b-4746-be4b-213214a879fe')
 *     }
 *   },
 *   Event: {
 *     typeIds: [Id('0349187b-526f-435f-b2bb-9e9caf23127a')],
 *     properties: {
 *       name: Id('3808e060-fb4a-4d08-8069-35b8c8a1902b'),
 *       description: Id('1f0d9007-8da2-4b28-ab9f-3bc0709f4837'),
 *     },
 *     relations: {
 *       speaker: Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')
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
export const SchemaDataTypePrimitive = EffectSchema.Literal('Text', 'Number', 'Checkbox', 'Date', 'Point');
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

export type GenerateMappingResult = [mapping: Mapping, ops: ReadonlyArray<Op>];

// Helper types for internal processing
type PropertyIdMapping = { propName: string; id: Grc20Id };
type TypeIdMapping = Map<string, Grc20Id | null>;
type ProcessedProperty =
  | { type: 'resolved'; mapping: PropertyIdMapping; ops: Array<Op> }
  | { type: 'deferred'; property: SchemaTypePropertyRelation };

type ProcessedType =
  | { type: 'complete'; entry: MappingEntry & { typeName: string }; ops: Array<Op> }
  | {
      type: 'deferred';
      schemaType: SchemaType;
      properties: Array<PropertyIdMapping>;
      relations: Array<PropertyIdMapping>;
    };

// Helper function to build property map from PropertyIdMappings
function buildPropertyMap(properties: Array<PropertyIdMapping>): MappingEntry['properties'] {
  return pipe(
    properties,
    EffectArray.reduce({} as NonNullable<MappingEntry['properties']>, (props, { propName, id }) => {
      props[toCamelCase(propName)] = id;
      return props;
    }),
  );
}

// Helper function to build relation map from PropertyIdMappings
function buildRelationMap(relations: Array<PropertyIdMapping>): MappingEntry['relations'] {
  return pipe(
    relations,
    EffectArray.reduce({} as NonNullable<MappingEntry['relations']>, (rels, { propName, id }) => {
      rels[toCamelCase(propName)] = id;
      return rels;
    }),
  );
}

// Helper function to create a property and return the result
function createPropertyWithOps(
  property: SchemaTypePropertyPrimitive | SchemaTypePropertyRelation,
  typeIdMap: TypeIdMapping,
): ProcessedProperty {
  if (property.knowledgeGraphId) {
    return {
      type: 'resolved',
      mapping: { propName: property.name, id: Grc20Id(property.knowledgeGraphId) },
      ops: [],
    };
  }

  if (propertyIsRelation(property)) {
    const relationTypeId = typeIdMap.get(property.relationType);
    if (relationTypeId == null) {
      return { type: 'deferred', property };
    }

    const { id, ops } = Graph.createProperty({
      name: property.name,
      dataType: 'RELATION',
      relationValueTypes: [relationTypeId],
    });
    return {
      type: 'resolved',
      mapping: { propName: property.name, id },
      ops,
    };
  }

  const { id, ops } = Graph.createProperty({
    name: property.name,
    dataType: mapSchemaDataTypeToGRC20PropDataType(property.dataType),
  });
  return {
    type: 'resolved',
    mapping: { propName: property.name, id },
    ops,
  };
}

// Helper function to process a single type
function processType(type: SchemaType, typeIdMap: TypeIdMapping): ProcessedType {
  const processedProperties = pipe(
    type.properties,
    EffectArray.map((prop) => createPropertyWithOps(prop, typeIdMap)),
  );

  const resolvedProperties = pipe(
    processedProperties,
    EffectArray.filterMap((p) => (p.type === 'resolved' ? Option.some(p) : Option.none())),
  );

  const deferredProperties = pipe(
    processedProperties,
    EffectArray.filterMap((p) => (p.type === 'deferred' ? Option.some(p.property) : Option.none())),
  );

  // Separate resolved properties into primitive properties and relations
  const primitiveProperties = pipe(
    resolvedProperties,
    EffectArray.filter((p) => {
      const originalProp = type.properties.find((prop) => prop.name === p.mapping.propName);
      return originalProp ? !propertyIsRelation(originalProp) : false;
    }),
    EffectArray.map((p) => p.mapping),
  );

  const relationProperties = pipe(
    resolvedProperties,
    EffectArray.filter((p) => {
      const originalProp = type.properties.find((prop) => prop.name === p.mapping.propName);
      return originalProp ? propertyIsRelation(originalProp) : false;
    }),
    EffectArray.map((p) => p.mapping),
  );

  const propertyOps = pipe(
    resolvedProperties,
    EffectArray.flatMap((p) => p.ops),
  );

  // If type exists in knowledge graph, return complete entry
  if (type.knowledgeGraphId) {
    const entry: MappingEntry & { typeName: string } = {
      typeName: toPascalCase(type.name),
      typeIds: [Grc20Id(type.knowledgeGraphId)],
    };

    if (EffectArray.isNonEmptyArray(primitiveProperties)) {
      entry.properties = buildPropertyMap(primitiveProperties);
    }

    if (EffectArray.isNonEmptyArray(relationProperties)) {
      entry.relations = buildRelationMap(relationProperties);
    }

    return {
      type: 'complete',
      entry,
      ops: propertyOps,
    };
  }

  // If there are deferred properties, defer type creation
  if (EffectArray.isNonEmptyArray(deferredProperties)) {
    return {
      type: 'deferred',
      schemaType: type,
      properties: primitiveProperties,
      relations: relationProperties,
    };
  }

  // Create the type with all resolved properties (both primitive and relations)
  const allPropertyIds = [...primitiveProperties, ...relationProperties];
  const { id, ops: typeOps } = Graph.createType({
    name: type.name,
    properties: pipe(
      allPropertyIds,
      EffectArray.map((p) => p.id),
    ),
  });

  typeIdMap.set(type.name, id);

  const entry: MappingEntry & { typeName: string } = {
    typeName: toPascalCase(type.name),
    typeIds: [id],
  };

  if (EffectArray.isNonEmptyArray(primitiveProperties)) {
    entry.properties = buildPropertyMap(primitiveProperties);
  }

  if (EffectArray.isNonEmptyArray(relationProperties)) {
    entry.relations = buildRelationMap(relationProperties);
  }

  return {
    type: 'complete',
    entry,
    ops: [...propertyOps, ...typeOps],
  };
}

/**
 * Takes the user-submitted schema, validates it, and build the `Mapping` definition for the schema as well as the GRC-20 Ops needed to publish the schema/schema changes to the Knowledge Graph.
 *
 * @example
 * ```ts
 * import { Id } from "@graphprotocol/grc-20"
 * import { generateMapping } from "@graphprotocol/typesync"
 *
 * const schema: Schema = {
 *   types: [
 *     {
 *       name: "Account",
 *       knowledgeGraphId: "a5fd07b1-120f-46c6-b46f-387ef98396a6",
 *       properties: [
 *         {
 *           name: "username",
 *           dataType: "Text",
 *           knowledgeGraphId: "994edcff-6996-4a77-9797-a13e5e3efad8"
 *         },
 *         {
 *           name: "createdAt",
 *           dataType: "Date",
 *           knowledgeGraphId: null
 *         }
 *       ]
 *     },
 *     {
 *       name: "Event",
 *       knowledgeGraphId: null,
 *       properties: [
 *         {
 *           name: "name",
 *           dataType: "Text",
 *           knowledgeGraphId: "3808e060-fb4a-4d08-8069-35b8c8a1902b"
 *         },
 *         {
 *           name: "description",
 *           dataType: "Text",
 *           knowledgeGraphId: null
 *         },
 *         {
 *           name: "speaker",
 *           dataType: "Relation(Account)",
 *           relationType: "Account",
 *           knowledgeGraphId: null
 *         }
 *       ]
 *     }
 *   ],
 * }
 * const [mapping, ops] = generateMapping(schema)
 *
 * expect(mapping).toEqual({
 *   Account: {
 *     typeIds: [Id("a5fd07b1-120f-46c6-b46f-387ef98396a6")], // comes from input schema
 *     properties: {
 *       username: Id("994edcff-6996-4a77-9797-a13e5e3efad8"), // comes from input schema
 *       createdAt: Id("8cd7d9ac-a878-4287-8000-e71e6f853117"), // generated from Graph.createProperty Op
 *     }
 *   },
 *   Event: {
 *     typeIds: [Id("20b3fe39-8e62-41a0-b9cb-92743fd760da")], // generated from Graph.createType Op
 *     properties: {
 *       name: Id("3808e060-fb4a-4d08-8069-35b8c8a1902b"), // comes from input schema
 *       description: Id("8fc4e17c-7581-4d6c-a712-943385afc7b5"), // generated from Graph.createProperty Op
 *     },
 *     relations: {
 *       speaker: Id("651ce59f-643b-4931-bf7a-5dc0ca0f5a47"), // generated from Graph.createProperty Op
 *     }
 *   }
 * })
 * expect(ops).toEqual([
 *   // Graph.createProperty Op for Account.createdAt property
 *   {
 *     type: "CREATE_PROPERTY",
 *     property: {
 *       id: Id("8cd7d9ac-a878-4287-8000-e71e6f853117"),
 *       dataType: "TEXT"
 *     }
 *   },
 *   // Graph.createProperty Op for Event.description property
 *   {
 *     type: "CREATE_PROPERTY",
 *     property: {
 *       id: Id("8fc4e17c-7581-4d6c-a712-943385afc7b5"),
 *       dataType: "TEXT"
 *     }
 *   },
 *   // Graph.createProperty Op for Event.speaker property
 *   {
 *     type: "CREATE_PROPERTY",
 *     property: {
 *       id: Id("651ce59f-643b-4931-bf7a-5dc0ca0f5a47"),
 *       dataType: "RELATION"
 *     }
 *   },
 *   // Graph.createType Op for Event type
 *   {
 *     type: "CREATE_PROPERTY",
 *     property: {
 *       id: Id("651ce59f-643b-4931-bf7a-5dc0ca0f5a47"),
 *       dataType: "RELATION"
 *     }
 *   },
 * ])
 * ```
 *
 * @since 0.0.1
 *
 * @param input user-built and submitted schema
 * @returns the generated [Mapping] definition from the submitted schema as well as the GRC-20 Ops required to publish the schema to the Knowledge Graph
 */
export function generateMapping(input: Schema): GenerateMappingResult {
  // Validate the schema
  const schema = SchemaKnownDecoder(input);

  // Build initial type ID map
  const typeIdMap: TypeIdMapping = pipe(
    schema.types,
    EffectArray.reduce(new Map<string, Grc20Id | null>(), (map, type) =>
      map.set(type.name, type.knowledgeGraphId != null ? Grc20Id(type.knowledgeGraphId) : null),
    ),
  );

  // First pass: process all types
  const processedTypes = pipe(
    schema.types,
    EffectArray.map((type) => processType(type, typeIdMap)),
  );

  // Separate complete and deferred types
  const [deferredTypes, completeTypes] = pipe(
    processedTypes,
    EffectArray.partition(
      (result): result is Extract<ProcessedType, { type: 'complete' }> => result.type === 'complete',
    ),
  );

  // Collect all operations from first pass
  const firstPassOps = pipe(
    completeTypes,
    EffectArray.flatMap((t) => t.ops),
  );

  // Second pass: resolve deferred relation properties and create deferred types
  const { entries: deferredEntries, ops: secondPassOps } = pipe(
    deferredTypes,
    EffectArray.reduce(
      { entries: [] as Array<MappingEntry & { typeName: string }>, ops: [] as Array<Op> },
      (acc, deferred) => {
        // Resolve all deferred relation properties for this type
        const resolvedRelations = pipe(
          deferred.schemaType.properties,
          EffectArray.filterMap((prop) => {
            if (!propertyIsRelation(prop) || prop.knowledgeGraphId != null) {
              return Option.none();
            }

            const relationTypeId = typeIdMap.get(prop.relationType);
            if (relationTypeId == null) {
              throw new RelationValueTypeDoesNotExistError({
                message: `Failed to resolve type ID for relation type: ${prop.relationType}`,
                property: prop.name,
                relatedType: prop.relationType,
              });
            }

            const { id, ops } = Graph.createProperty({
              name: prop.name,
              dataType: 'RELATION',
              relationValueTypes: [relationTypeId],
            });

            return Option.some({ mapping: { propName: prop.name, id }, ops });
          }),
        );

        // Combine resolved relations with existing relations
        const allRelations = [
          ...deferred.relations,
          ...pipe(
            resolvedRelations,
            EffectArray.map((r) => r.mapping),
          ),
        ];

        // Combine all property IDs for type creation
        const allPropertyIds = [...deferred.properties, ...allRelations];

        // Create the type with all properties
        const { id, ops: typeOps } = Graph.createType({
          name: deferred.schemaType.name,
          properties: pipe(
            allPropertyIds,
            EffectArray.map((p) => p.id),
          ),
        });

        typeIdMap.set(deferred.schemaType.name, id);

        // Collect all operations
        const allOps = [
          ...pipe(
            resolvedRelations,
            EffectArray.flatMap((r) => r.ops),
          ),
          ...typeOps,
        ];

        // Build the entry with properties and relations separated
        const entry: MappingEntry & { typeName: string } = {
          typeName: toPascalCase(deferred.schemaType.name),
          typeIds: [id],
        };

        if (EffectArray.isNonEmptyArray(deferred.properties)) {
          entry.properties = buildPropertyMap(deferred.properties);
        }

        if (EffectArray.isNonEmptyArray(allRelations)) {
          entry.relations = buildRelationMap(allRelations);
        }

        return {
          entries: [...acc.entries, entry],
          ops: [...acc.ops, ...allOps],
        };
      },
    ),
  );

  // Combine all entries and build final mapping
  const allEntries = [
    ...pipe(
      completeTypes,
      EffectArray.map((t) => t.entry),
    ),
    ...deferredEntries,
  ];

  const mapping = pipe(
    allEntries,
    EffectArray.reduce({} as Mapping, (mapping, entry) => {
      const { typeName, ...rest } = entry;
      mapping[typeName] = rest;
      return mapping;
    }),
  );

  return [mapping, [...firstPassOps, ...secondPassOps]] as const;
}

export class RelationValueTypeDoesNotExistError extends Data.TaggedError(
  '/typesync/errors/RelationValueTypeDoesNotExistError',
)<{
  readonly message: string;
  readonly property: string;
  readonly relatedType: string;
}> {}

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
    case isDataTypeRelation(dataType): {
      return 'RELATION';
    }
    default: {
      return 'TEXT';
    }
  }
}
