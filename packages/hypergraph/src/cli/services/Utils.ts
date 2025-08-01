import { Data, Effect, Array as EffectArray } from 'effect';
import ts from 'typescript';

import * as Mapping from '../../mapping/Mapping.js';
import * as Utils from '../../mapping/Utils.js';

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
): Effect.Effect<Mapping.Schema, SchemaParserFailure> =>
  Effect.try({
    try() {
      const sourceFile = ts.createSourceFile('schema.ts', sourceCode, ts.ScriptTarget.Latest, true);

      const entities: Array<Mapping.SchemaType> = [];

      const visit = (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && node.name) {
          const className = node.name.text;
          const properties: Array<Mapping.SchemaTypePropertyPrimitive | Mapping.SchemaTypePropertyRelation> = [];

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

                          const mappingEntry = mapping[className];
                          const camelCasePropName = Utils.toCamelCase(propName);

                          // Extract the type
                          if (ts.isPropertyAccessExpression(prop.initializer)) {
                            // Simple types like Type.Text
                            dataType = Mapping.getDataType(prop.initializer.name.text);

                            // Look up the property's knowledgeGraphId from the mapping
                            const propKnowledgeGraphId = mappingEntry?.properties?.[camelCasePropName] || null;

                            // push to type properties as primitive property
                            properties.push({
                              name: propName,
                              dataType: dataType as Mapping.SchemaDataTypePrimitive,
                              knowledgeGraphId: propKnowledgeGraphId,
                            } satisfies Mapping.SchemaTypePropertyPrimitive);
                          } else if (ts.isCallExpression(prop.initializer)) {
                            // Relation types like Type.Relation(User)
                            const callNode = prop.initializer;
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
                                  } satisfies Mapping.SchemaTypePropertyRelation);
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

          entities.push({ name: className, knowledgeGraphId: typeKnowledgeGraphId, properties });
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
