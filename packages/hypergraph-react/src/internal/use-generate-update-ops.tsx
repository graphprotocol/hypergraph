import { type Op, Triple, type Value } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import { useHypergraph } from '../HypergraphSpaceContext.js';
import type { DiffEntry } from '../types.js';

export function useGenerateUpdateOps<const S extends Entity.AnyNoContext>(type: S, enabled = true) {
  const { mapping } = useHypergraph();

  return ({ id, __deleted, __version, ...properties }: DiffEntry<S>) => {
    // @ts-expect-error TODO should use the actual type instead of the name in the mapping
    const typeName = type.name;
    const mappingEntry = mapping?.[typeName];
    if (!mappingEntry && enabled) {
      throw new Error(`Mapping entry for ${typeName} not found`);
    }

    if (!enabled || !mappingEntry || !mappingEntry.properties) {
      return { ops: [] };
    }
    const ops: Op[] = [];

    for (const [key, rawValue] of Object.entries(properties)) {
      const attributeId = mappingEntry.properties[key];
      if (attributeId) {
        let value: Value;
        if (typeof rawValue === 'boolean') {
          value = {
            type: 'CHECKBOX',
            value: rawValue ? '1' : '0',
          };
        } else {
          value = {
            type: 'TEXT',
            value: rawValue,
          };
        }

        const op = Triple.make({
          attributeId,
          entityId: id,
          value,
        });
        ops.push(op);
      } else {
        // TODO; throw an error?
        console.error(`Attribute ${key} not found in mapping`);
      }
    }
    return { ops };
  };
}
