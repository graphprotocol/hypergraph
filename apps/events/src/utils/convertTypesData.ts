import { Type } from '@graphprotocol/hypergraph';
import { typesData } from '../data/typesData';

// Type definitions for the data structure
interface Property {
  id: string;
  dataType: string;
  relationValueTypes: Array<{
    id: string;
    name: string;
    description: string | null;
    properties: Array<{
      id: string;
      dataType: string;
      entity: {
        id: string;
        name: string;
      };
    }>;
  }>;
  entity: {
    id: string;
    name: string;
  };
}

interface TypeData {
  id: string;
  name: string;
  properties: Property[];
}

interface TypesData {
  types: TypeData[];
}

interface MappingEntry {
  typeIds: string[];
  properties: Record<string, string>;
  relations?: Record<string, string>;
}

interface TypeWithSchemaAndMapping {
  id: string;
  name: string;
  className: string;
  properties: Property[];
  schema: string;
  mapping: string;
}

// Helper function to convert dataType to Type
function dataTypeToType(
  dataType: string,
):
  | typeof Type.Text
  | typeof Type.Number
  | typeof Type.Relation
  | typeof Type.Checkbox
  | typeof Type.Date
  | typeof Type.Point
  | typeof Type.Url {
  switch (dataType) {
    case 'TEXT':
      return Type.Text;
    case 'NUMBER':
      return Type.Number;
    case 'RELATION':
      return Type.Relation; // This will need to be handled specially
    case 'CHECKBOX':
      return Type.Checkbox;
    case 'DATE':
      return Type.Date;
    case 'POINT':
      return Type.Point;
    case 'URL':
      return Type.Url;
    default:
      return Type.Text; // fallback
  }
}

// Helper function to get relation target class name
function getRelationTargetClassName(
  relationValueTypes: Array<{
    id: string;
    name: string;
    description: string | null;
    properties: Array<{ id: string; dataType: string; entity: { id: string; name: string } }>;
  }>,
): string | null {
  if (relationValueTypes.length === 0) return null;
  return relationValueTypes[0].name;
}

// Helper function to create a class name from type name
function createClassName(typeName: string): string {
  // Convert to PascalCase and handle special cases
  return typeName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Helper function to convert string to camelCase
function toCamelCase(str: string): string {
  return str
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        // First word should be lowercase
        return word.toLowerCase();
      }
      // Subsequent words should be capitalized
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

export function convertTypesDataToSchemaAndMapping() {
  const schemaEntries: string[] = [];
  const mappingEntries: Record<string, MappingEntry> = {};

  // Create a map of type names to their IDs for relation handling
  const typeNameToId = new Map<string, string>();
  const typeIdToName = new Map<string, string>();

  // First pass: collect all type names and IDs
  for (const type of typesData.types) {
    typeNameToId.set(type.name, type.id);
    typeIdToName.set(type.id, type.name);
  }

  // Second pass: generate schema and mapping
  for (const type of typesData.types) {
    const className = createClassName(type.name);

    // Generate schema entry
    const properties: string[] = [];
    const mappingProperties: Record<string, string> = {};
    const mappingRelations: Record<string, string> = {};

    for (const property of type.properties) {
      const propertyName = toCamelCase(property.entity.name);

      if (property.dataType === 'RELATION') {
        const targetClassName = getRelationTargetClassName(property.relationValueTypes);
        if (targetClassName) {
          const targetClass = createClassName(targetClassName);
          properties.push(`  ${propertyName}: Type.Relation(${targetClass})`);
          mappingRelations[propertyName] = `Id.Id('${property.id}')`;
        }
      } else {
        const typeInstance = dataTypeToType(property.dataType);
        const typeName = typeInstance.name.endsWith('$') ? typeInstance.name.slice(0, -1) : typeInstance.name;
        properties.push(`  ${propertyName}: Type.${typeName}`);
        mappingProperties[propertyName] = `Id.Id('${property.id}')`;
      }
    }

    // Generate schema class
    const schemaClass = `export class ${className} extends Entity.Class<${className}>('${className}')({
${properties.join(',\n')}
}) {}`;

    schemaEntries.push(schemaClass);

    // Generate mapping entry
    mappingEntries[className] = {
      typeIds: [`Id.Id('${type.id}')`],
      properties: mappingProperties,
      ...(Object.keys(mappingRelations).length > 0 && { relations: mappingRelations }),
    };
  }

  return {
    schema: schemaEntries.join('\n\n'),
    mapping: mappingEntries,
  };
}

// Function to generate the complete schema file content
export function generateSchemaFile(): string {
  const { schema } = convertTypesDataToSchemaAndMapping();
  return `import { Entity, Type } from '@graphprotocol/hypergraph';

${schema}
`;
}

// Function to generate the complete mapping file content
export function generateMappingFile(): string {
  const { mapping } = convertTypesDataToSchemaAndMapping();

  const mappingEntries = Object.entries(mapping)
    .map(([className, mappingData]) => {
      const properties = Object.entries(mappingData.properties || {})
        .map(([key, value]) => `    ${key}: ${value}`)
        .join(',\n');

      const relations = mappingData.relations
        ? Object.entries(mappingData.relations)
            .map(([key, value]) => `    ${key}: ${value}`)
            .join(',\n')
        : '';

      return `  ${className}: {
    typeIds: [${mappingData.typeIds.join(', ')}],
    properties: {
${properties}
    },
${
  relations
    ? `    relations: {
${relations}
    },`
    : ''
}
  }`;
    })
    .join(',\n\n');

  return `import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
${mappingEntries}
};
`;
}

// Function to generate schema for a single type
export function generateSchemaForType(type: TypeData): string {
  const className = createClassName(type.name);

  const properties: string[] = [];

  for (const property of type.properties) {
    const propertyName = toCamelCase(property.entity.name);

    if (property.dataType === 'RELATION') {
      const targetClassName = getRelationTargetClassName(property.relationValueTypes);
      if (targetClassName) {
        const targetClass = createClassName(targetClassName);
        properties.push(`  ${propertyName}: Type.Relation(${targetClass})`);
      }
    } else {
      const typeInstance = dataTypeToType(property.dataType);
      const typeName = typeInstance.name.endsWith('$') ? typeInstance.name.slice(0, -1) : typeInstance.name;
      properties.push(`  ${propertyName}: Type.${typeName}`);
    }
  }

  return `export class ${className} extends Entity.Class<${className}>('${className}')({
${properties.join(',\n')}
}) {}`;
}

// Function to generate mapping for a single type
export function generateMappingForType(type: TypeData): string {
  const className = createClassName(type.name);

  const mappingProperties: Record<string, string> = {};
  const mappingRelations: Record<string, string> = {};

  for (const property of type.properties) {
    const propertyName = toCamelCase(property.entity.name);

    if (property.dataType === 'RELATION') {
      const targetClassName = getRelationTargetClassName(property.relationValueTypes);
      if (targetClassName) {
        mappingRelations[propertyName] = `Id.Id('${property.id}')`;
      }
    } else {
      mappingProperties[propertyName] = `Id.Id('${property.id}')`;
    }
  }

  const properties = Object.entries(mappingProperties)
    .map(([key, value]) => `    ${key}: ${value}`)
    .join(',\n');

  const relations = Object.entries(mappingRelations)
    .map(([key, value]) => `    ${key}: ${value}`)
    .join(',\n');

  return `  ${className}: {
    typeIds: [Id.Id('${type.id}')],
    properties: {
${properties}
    },
${
  relations
    ? `    relations: {
${relations}
    },`
    : ''
}
  }`;
}

// Function to get all types with their individual schema and mapping
export function getTypesWithSchemaAndMapping(): TypeWithSchemaAndMapping[] {
  return typesData.types.map((type) => {
    const className = createClassName(type.name);

    return {
      id: type.id,
      name: type.name,
      className,
      properties: type.properties,
      schema: generateSchemaForType(type),
      mapping: generateMappingForType(type),
    };
  });
}
