import { describe, expect, it } from 'vitest';
import { convertTypesDataToSchemaAndMapping, generateMappingFile, generateSchemaFile } from './convertTypesData';

describe('convertTypesData', () => {
  it('should convert typesData to schema and mapping', () => {
    const result = convertTypesDataToSchemaAndMapping();

    expect(result).toHaveProperty('schema');
    expect(result).toHaveProperty('mapping');
    expect(typeof result.schema).toBe('string');
    expect(typeof result.mapping).toBe('object');
  });

  it('should generate schema file with proper imports', () => {
    const schema = generateSchemaFile();

    expect(schema).toContain("import { Entity, Type } from '@graphprotocol/hypergraph';");
    expect(schema).toContain('export class');
  });

  it('should generate mapping file with proper imports', () => {
    const mapping = generateMappingFile();

    expect(mapping).toContain("import { Id } from '@graphprotocol/grc-20';");
    expect(mapping).toContain("import type { Mapping } from '@graphprotocol/hypergraph';");
    expect(mapping).toContain('export const mapping: Mapping = {');
  });

  it('should handle relation properties correctly', () => {
    const result = convertTypesDataToSchemaAndMapping();

    // Check if any mapping entries have relations
    const hasRelations = Object.values(result.mapping).some((entry) => entry.relations);
    expect(hasRelations).toBe(true);
  });

  it('should generate valid class names', () => {
    const result = convertTypesDataToSchemaAndMapping();

    // Check if schema contains valid class definitions
    expect(result.schema).toMatch(/export class \w+ extends Entity\.Class/);
  });
});
