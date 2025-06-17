import type { AppSchema } from '../../../schema.js';

function fieldToEntityString({
  name,
  type_name,
  nullable = false,
  optional = false,
  description,
}: AppSchema['types'][number]['properties'][number]): string {
  // Add JSDoc comment if description exists
  const jsDoc = description ? `  /** ${description} */\n` : '';

  // Convert type to Entity type
  const entityType = (() => {
    switch (true) {
      case type_name === 'Text':
        return 'Type.Text';
      case type_name === 'Number':
        return 'Type.Number';
      case type_name === 'Boolean':
        return 'Type.Boolean';
      case type_name === 'Date':
        return 'Type.Date';
      case type_name === 'Url':
        return 'Type.Url';
      case type_name === 'Point':
        return 'Type.Point';
      case type_name.startsWith('Relation'):
        // renders the type as `Type.Relation(Entity)`
        return `Type.${type_name}`;
      default:
        // how to handle complex types
        return 'Type.Text';
    }
  })();

  let derivedEntityType = entityType;
  if (optional) {
    derivedEntityType = `Schema.NullishOr(${derivedEntityType})`;
  } else if (nullable) {
    derivedEntityType = `Schema.NullOr(${entityType})`;
  }

  return `${jsDoc}  ${name}: ${derivedEntityType}`;
}

function typeDefinitionToString(type: {
  name: string;
  properties: ReadonlyArray<AppSchema['types'][number]['properties'][number]>;
}): string | null {
  if (!type.name) {
    return null;
  }
  const fields = type.properties.filter((_prop) => _prop.name != null && _prop.name.length > 0);
  if (fields.length === 0) {
    return null;
  }

  const fieldStrings = fields.map(fieldToEntityString);

  const capitalizedName = type.name.charAt(0).toUpperCase() + type.name.slice(1);
  return `export class ${capitalizedName} extends Entity.Class<${capitalizedName}>('${capitalizedName}')({
${fieldStrings.join(',\n')}
}) {}`;
}

/**
 * Take the input schema and create a typescript code string representation to render in the preview
 *
 * @example
 * ```ts
 * const schema: AppSchemaForm = {
 *  types: [
 *    {
 *      name: "Event",
 *      fields: [
 *        { name: 'name', type: Text, description: 'Name of the event' },
 *        { name: 'description', type: Schema.NullOr(Text) }
 *      ]
 *    }
 *  ]
 * }
 *
 * const { code } = buildAppSchemaFormCode(schema)
 *
 * expect(code).toEqual(`
 *  import * as Entity from '@graphprotocol/hypergraph/Entity';
 *
 *  export class Event extends Entity.Class<Event>('Event')({
 *    // Name of the event
 *    name: string;
 *    description: string | null;
 *  }) {}
 * `)
 * ```
 *
 * @param schema the app schema being built by the user
 * @returns a typescript string representation of the schema as well as a 20bit hash to pass to the useQuery hook
 */
export function buildAppSchemaFormCode(schema: AppSchema): Readonly<{ code: string; hash: string }> {
  const fileCommentStatement = '// src/schema.ts';
  const importStatement = `import { Entity, Type } from '@graphprotocol/hypergraph';\nimport * as Schema from 'effect/Schema';`;
  const typeDefinitions = schema.types
    .map(typeDefinitionToString)
    .filter((def) => def != null)
    .join('\n\n');
  const code = [fileCommentStatement, importStatement, typeDefinitions].join('\n\n');

  const byteArray = new TextEncoder().encode(code);

  // Use a simple but deterministic hashing algorithm
  let hash = 0;
  for (let i = 0; i < byteArray.length; i++) {
    hash = (hash << 5) - hash + byteArray[i];
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex string and ensure it's 20 bytes (40 characters)
  const hexHash = Math.abs(hash).toString(16).padStart(40, '0');
  const generatedHash = hexHash.slice(0, 40);

  return {
    code,
    hash: generatedHash,
  } as const;
}
