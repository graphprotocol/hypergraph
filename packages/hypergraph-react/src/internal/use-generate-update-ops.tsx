import { Id, type Op, Relation, Triple, type Value } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import { useHypergraph } from '../HypergraphSpaceContext.js';
import type { DiffEntry } from '../types.js';

export function useGenerateUpdateOps<const S extends Entity.AnyNoContext>(type: S, enabled = true) {
  const { mapping } = useHypergraph();

  return ({ id, diff }: { id: string; diff: DiffEntry }) => {
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

    for (const [key, propertyId] of Object.entries(mappingEntry.properties || {})) {
      if (diff[key] === undefined) {
        continue;
      }
      const propertyDiff = diff[key];
      if (propertyDiff === undefined || propertyDiff.type === 'relation') {
        throw new Error(`Invalid diff or mapping for generating update Ops on the property \`${key}\``);
      }

      const rawValue = propertyDiff.new;

      let value: Value;
      if (typeof rawValue === 'boolean') {
        value = {
          type: 'CHECKBOX',
          value: rawValue ? '1' : '0',
        };
      } else {
        value = {
          type: 'TEXT',
          value: rawValue as string,
        };
      }

      const op = Triple.make({
        attributeId: propertyId,
        entityId: id,
        value,
      });
      ops.push(op);
    }

    for (const [key, relationId] of Object.entries(mappingEntry.relations || {})) {
      const relationDiff = diff[key];
      if (relationDiff === undefined || relationDiff.type === 'property') {
        throw new Error(`Invalid diff or mapping for generating update Ops on the relation \`${key}\``);
      }
      for (const toId of relationDiff.addedIds) {
        const op = Relation.make({
          fromId: Id.Id(id),
          toId: Id.Id(toId),
          relationTypeId: relationId,
        });
        ops.push(op);
      }
    }

    return { ops };
  };
}
