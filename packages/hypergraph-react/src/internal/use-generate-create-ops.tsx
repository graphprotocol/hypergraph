import { Graph, Id, type PropertiesParam, type ValueType } from '@graphprotocol/grc-20';
import { Entity } from '@graphprotocol/hypergraph';
import { useHypergraph } from '../HypergraphSpaceContext.js';

export function useGenerateCreateOps<const S extends Entity.AnyNoContext>(type: S, enabled = true) {
  const { mapping } = useHypergraph();
  // @ts-expect-error TODO should use the actual type instead of the name in the mapping
  const typeName = type.name;
  const mappingEntry = mapping?.[typeName];
  if (!mappingEntry && enabled) {
    throw new Error(`Mapping entry for ${typeName} not found`);
  }

  return (properties: Entity.Entity<S>) => {
    if (!enabled || !mappingEntry) {
      return { ops: [] };
    }
    const fields = type.fields;
    const grcProperties: PropertiesParam = {};
    for (const [key, value] of Object.entries(mappingEntry.properties)) {
      let valueType: ValueType = 'TEXT';
      let serializedValue: string = properties[key];
      if (fields[key] === Entity.Checkbox) {
        valueType = 'CHECKBOX';
        serializedValue = properties[key] ? '1' : '0';
      }

      grcProperties[value] = {
        type: valueType,
        value: serializedValue,
      };
    }

    const { ops, id } = Graph.createEntity({
      types: mappingEntry.typeIds,
      properties: grcProperties,
      id: Id.Id(properties.id),
    });
    return { ops, id };
  };
}
