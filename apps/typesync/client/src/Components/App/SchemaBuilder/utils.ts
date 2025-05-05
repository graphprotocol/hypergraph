import type { AppSchemaField, AppSchemaForm } from './types.js';

function fieldToEntityString({
  name,
  typeName,
  nullable = false,
  optional = false,
  description,
}: AppSchemaField): string {
  // Add JSDoc comment if description exists
  const jsDoc = description ? `  /** ${description} */\n` : '';

  // Convert type to Entity type
  const entityType = (() => {
    switch (typeName) {
      case 'Text':
        return 'Entity.Text';
      case 'Number':
        return 'Entity.Number';
      case 'Checkbox':
        return 'Entity.Checkbox';
      default:
        // how to handle complex types
        return 'Entity.Any';
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
  properties: Readonly<Array<AppSchemaField>>;
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
  return `class ${capitalizedName} extends Entity.Class<${capitalizedName}>('${capitalizedName}')({
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
 *  class Event extends Entity.Class<Event>('Event')({
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
export function buildAppSchemaFormCode(schema: AppSchemaForm): Readonly<{ code: string; hash: string }> {
  const fileCommentStatement = '// src/schema.ts';
  const importStatement = `import * as Entity from '@graphprotocol/hypergraph/Entity';\nimport * as Schema from 'effect/Schema';`;
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
