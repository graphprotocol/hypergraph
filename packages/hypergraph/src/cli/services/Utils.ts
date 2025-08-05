import { Doc } from '@effect/printer';
import { Data, Effect, Array as EffectArray } from 'effect';
import ts from 'typescript';

import * as Mapping from '../../mapping/Mapping.js';
import * as Utils from '../../mapping/Utils.js';
import type * as Model from './Model.js';

/**
 * Takes a parsed schema.ts file and maps it to a the Mapping.Schema type.
 *
 * @internal
 *
 * @param sourceCode the read schema.ts file
 * @param mapping the parsed mappint.ts file
 * @returns the parsed Schema instance
 */
export const parseSchema = (
  sourceCode: string,
  mapping: Mapping.Mapping,
): Effect.Effect<Model.TypesyncHypergraphSchema, SchemaParserFailure> =>
  Effect.try({
    try() {
      const sourceFile = ts.createSourceFile('schema.ts', sourceCode, ts.ScriptTarget.Latest, true);

      const entities: Array<Model.TypesyncHypergraphSchemaType> = [];

      const visit = (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && node.name) {
          const className = node.name.text;
          const properties: Array<Model.TypesyncHypergraphSchemaTypeProperty> = [];

          // Find the Entity.Class call
          if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
              for (const type of clause.types) {
                if (ts.isCallExpression(type.expression)) {
                  const callExpr = type.expression;

                  // Look for the object literal with properties
                  if (callExpr.arguments.length > 0) {
                    const arg = callExpr.arguments[0];
                    if (ts.isObjectLiteralExpression(arg)) {
                      for (const prop of arg.properties) {
                        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                          const propName = prop.name.text;
                          let dataType: Mapping.SchemaDataType = 'String';
                          let relationType: string | undefined;
                          let isOptional = false;

                          const mappingEntry = mapping[className];
                          const camelCasePropName = Utils.toCamelCase(propName);

                          // Check if the property is wrapped with Type.optional()
                          let typeExpression = prop.initializer;
                          if (
                            ts.isCallExpression(typeExpression) &&
                            ts.isPropertyAccessExpression(typeExpression.expression) &&
                            typeExpression.expression.name.text === 'optional'
                          ) {
                            isOptional = true;
                            // Unwrap the optional to get the actual type
                            if (typeExpression.arguments.length > 0) {
                              typeExpression = typeExpression.arguments[0];
                            }
                          }

                          // Extract the type
                          if (ts.isPropertyAccessExpression(typeExpression)) {
                            // Simple types like Type.String
                            dataType = Mapping.getDataType(typeExpression.name.text);

                            // Look up the property's knowledgeGraphId from the mapping
                            const propKnowledgeGraphId = mappingEntry?.properties?.[camelCasePropName] || null;

                            // push to type properties as primitive property
                            properties.push({
                              name: propName,
                              dataType: dataType as Mapping.SchemaDataTypePrimitive,
                              knowledgeGraphId: propKnowledgeGraphId,
                              optional: isOptional || undefined,
                              status: propKnowledgeGraphId != null ? 'published' : 'synced',
                            } satisfies Model.TypesyncHypergraphSchemaTypeProperty);
                          } else if (ts.isCallExpression(typeExpression)) {
                            // Relation types like Type.Relation(User)
                            const callNode = typeExpression;
                            if (ts.isPropertyAccessExpression(callNode.expression)) {
                              const typeName = callNode.expression.name.text;

                              if (typeName === 'Relation' && callNode.arguments.length > 0) {
                                const relationArg = callNode.arguments[0];
                                if (ts.isIdentifier(relationArg)) {
                                  relationType = relationArg.text;
                                  dataType = `Relation(${relationType})`;

                                  // Look up the relation property's knowledgeGraphId from the mapping
                                  const relKnowledgeGraphId = mappingEntry?.relations?.[camelCasePropName] || null;

                                  // push to type properties as relation property
                                  properties.push({
                                    name: propName,
                                    dataType,
                                    relationType,
                                    knowledgeGraphId: relKnowledgeGraphId,
                                    optional: isOptional || undefined,
                                    status: relKnowledgeGraphId != null ? 'published' : 'synced',
                                  } satisfies Model.TypesyncHypergraphSchemaTypeProperty);
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          // Look up the type's knowledgeGraphId from the mapping
          const mappingEntry = mapping[Utils.toPascalCase(className)];
          const typeKnowledgeGraphId = mappingEntry?.typeIds?.[0] ? mappingEntry.typeIds[0] : null;

          entities.push({
            name: className,
            knowledgeGraphId: typeKnowledgeGraphId,
            properties,
            status: typeKnowledgeGraphId != null ? 'published' : 'synced',
          });
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);

      return {
        types: entities,
      } as const;
    },
    catch(error) {
      return new SchemaParserFailure({
        message: `Failed to parse schema: ${error}`,
        cause: error,
      });
    },
  });

export class SchemaParserFailure extends Data.TaggedError('/Hypergraph/cli/errors/SchemaParserFailure')<{
  readonly message: string;
  readonly cause: unknown;
}> {}

/**
 * @internal
 *
 * Runtime check to see if a value looks like a Mapping
 */
function isMappingLike(value: unknown): value is Mapping.Mapping {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value).every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      'typeIds' in entry &&
      // biome-ignore lint/suspicious/noExplicitAny: parsing so type unknown
      EffectArray.isArray((entry as any).typeIds),
  );
}

/**
 * @internal
 *
 * Look at the exported object from the mapping.ts file loaded via jiti and try to pull out the hypergraph mapping.
 * Default should be:
 * ```typescript
 * export const mapping: Mapping
 * ```
 * But this is not guaranteed. This function looks through the file to try to find it using some logical defaults/checks.
 *
 * @param moduleExport the object imported from jiti from the mapping.ts file
 */
// biome-ignore lint/suspicious/noExplicitAny: type should be import object from jiti
export function parseHypergraphMapping(moduleExport: any): Mapping.Mapping {
  // Handle null/undefined inputs
  if (!moduleExport || typeof moduleExport !== 'object') {
    return {} as Mapping.Mapping;
  }

  // Find all exports that look like Mapping objects
  const mappingCandidates = Object.entries(moduleExport).filter(([, value]) => isMappingLike(value));

  if (mappingCandidates.length === 0) {
    return {} as Mapping.Mapping;
  }

  if (mappingCandidates.length === 1) {
    return mappingCandidates[0][1] as Mapping.Mapping;
  }

  // Multiple candidates - prefer common names
  const preferredNames = ['mapping', 'default', 'config'];
  for (const preferredName of preferredNames) {
    const found = mappingCandidates.find(([name]) => name === preferredName);
    if (found) {
      return found[1] as Mapping.Mapping;
    }
  }

  // If no preferred names found, use the first one
  return mappingCandidates[0][1] as Mapping.Mapping;
}

function fieldToEntityString({ name, dataType, optional = false }: Model.TypesyncHypergraphSchemaTypeProperty): string {
  // Convert type to Entity type
  const entityType = (() => {
    switch (true) {
      case dataType === 'String':
        return 'Type.String';
      case dataType === 'Number':
        return 'Type.Number';
      case dataType === 'Boolean':
        return 'Type.Boolean';
      case dataType === 'Date':
        return 'Type.Date';
      case dataType === 'Point':
        return 'Type.Point';
      case Mapping.isDataTypeRelation(dataType):
        // renders the type as `Type.Relation(Entity)`
        return `Type.${dataType}`;
      default:
        // how to handle complex types
        return 'Type.String';
    }
  })();

  if (optional === true) {
    return `  ${Utils.toCamelCase(name)}: Type.optional(${entityType})`;
  }

  // adds a tab before the property
  return `  ${Utils.toCamelCase(name)}: ${entityType}`;
}

function typeDefinitionToString(type: Model.TypesyncHypergraphSchemaType): string | null {
  if (!type.name) {
    return null;
  }
  const fields = type.properties.filter((_prop) => _prop.name != null && _prop.name.length > 0);
  if (fields.length === 0) {
    return null;
  }

  const fieldStrings = fields.map(fieldToEntityString);

  const name = Utils.toPascalCase(type.name);
  return `export class ${name} extends Entity.Class<${name}>('${name}')({
${fieldStrings.join(',\n')}
}) {}`;
}

/**
 * Builds a string of the schema.ts file contents after parsing the schema into the correct format.
 *
 * @example
 *
 * ```typescript
 * const schema = Model.TypesyncHypergraphSchema.make({
 *   types: [
 *     {
 *       name: "User",
 *       knowledgeGraphId: null,
 *       status: null,
 *       properties: [
 *         {
 *           name: "name",
 *           dataType: "String",
 *           knowledgeGraphId: null,
 *           optional: null,
 *           status: null
 *         }
 *       ]
 *     }
 *   ]
 * })
 * const schemaFile = buildSchemaFile(schema)
 *
 * expect(schemaFile).toEqual(`
 * import { Entity, Type } from '@graphprotocol/hypergraph';
 *
 * export class User extends Entity.Class<User>('User')({
 *   name: Type.String
 * }) {}
 * `)
 * ```
 */
export function buildSchemaFile(schema: Model.TypesyncHypergraphSchema) {
  const importStatement = `import { Entity, Type } from '@graphprotocol/hypergraph';`;

  const typeDefinitions = schema.types
    .map(typeDefinitionToString)
    .filter((def) => def != null)
    .join('\n\n');
  return [importStatement, typeDefinitions].join('\n\n');
}

export function buildMappingFile(mapping: Mapping.Mapping | Model.TypesyncHypergraphMapping) {
  // Import statements
  const imports = Doc.vsep([
    Doc.text("import type { Mapping } from '@graphprotocol/hypergraph/mapping';"),
    Doc.text("import { Id } from '@graphprotocol/hypergraph';"),
  ]);

  // Generate the mapping object - build it line by line for exact formatting
  const mappingLines = [Doc.text('export const mapping: Mapping = {')];

  for (const [typeName, typeData] of Object.entries(mapping)) {
    mappingLines.push(Doc.text(`  ${typeName}: {`));

    // Type IDs
    const typeIdsList = typeData.typeIds.map((id: string) => `Id("${id}")`).join(', ');
    mappingLines.push(Doc.text(`    typeIds: [${typeIdsList}],`));

    // Properties
    const properties = Object.entries(typeData.properties ?? {});
    if (EffectArray.isNonEmptyArray(properties)) {
      mappingLines.push(Doc.text('    properties: {'));
      properties.forEach(([propName, propId], index, entries) => {
        const isLast = index === entries.length - 1;
        const comma = isLast ? '' : ',';
        mappingLines.push(Doc.text(`      ${propName}: Id("${propId}")${comma}`));
      });
      mappingLines.push(Doc.text('    },'));
    }

    // Relations
    const relations = Object.entries(typeData.relations ?? {});
    if (EffectArray.isNonEmptyArray(relations)) {
      mappingLines.push(Doc.text('    relations: {'));
      relations.forEach(([relationName, relationId], index, entries) => {
        const isLast = index === entries.length - 1;
        const comma = isLast ? '' : ',';
        mappingLines.push(Doc.text(`      ${relationName}: Id("${relationId}")${comma}`));
      });
      mappingLines.push(Doc.text('    },'));
    }

    mappingLines.push(Doc.text('  },'));
  }

  mappingLines.push(Doc.rbrace);

  const compiled = Doc.vcat([imports, Doc.empty, ...mappingLines]);

  return Doc.render(compiled, {
    style: 'pretty',
    options: { lineWidth: 120 },
  });
}

/**
 * Builds a string of the mapping.ts file contents after parsing the schema into the correct mapping format.
 *
 * @example
 *
 * ```typescript
 * const schema = Model.TypesyncHypergraphSchema.make({
 *   types: [
 *     {
 *       name: "User",
 *       knowledgeGraphId: "7f9562d4-034d-4385-bf5c-f02cdebba47a",
 *       status: null,
 *       properties: [
 *         {
 *           name: "name",
 *           dataType: "String",
 *           knowledgeGraphId: "a126ca53-0c8e-48d5-b888-82c734c38935",
 *           optional: null,
 *           status: null
 *         }
 *       ]
 *     }
 *   ]
 * })
 * const mappingFile = buildMappingFile(schema)
 *
 * expect(mappingFile).toEqual(`
 * import type { Mapping } from '@graphprotocol/hypergraph/mapping';
 * import { Id } from '@graphprotocol/hypergraph';
 *
 * export const mapping: Mapping = {
 *   User: {
 *     typeIds: [Id('7f9562d4-034d-4385-bf5c-f02cdebba47a')],
 *     properties: {
 *       name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
 *     }
 *   }
 * }
 * `)
 * ```
 */
export function buildMappingFileFromSchema(schema: Model.TypesyncHypergraphSchema) {
  const [mapping] = Mapping.generateMapping(schema);

  return buildMappingFile(mapping);
}
