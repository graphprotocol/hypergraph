import type { Op } from '@graphprotocol/grc-20';
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

    // for (const [key, propertyId] of Object.entries(mappingEntry.properties || {})) {
    //   if (diff[key] === undefined) {
    //     continue;
    //   }
    //   const propertyDiff = diff[key];
    //   if (propertyDiff === undefined || propertyDiff.type === 'relation') {
    //     throw new Error(`Invalid diff or mapping for generating update Ops on the property \`${key}\``);
    //   }

    //   const rawValue = propertyDiff.new;

    //   let value: Value;
    //   if (type.fields[key] === Type.Checkbox) {
    //     value = {
    //       type: 'CHECKBOX',
    //       value: rawValue ? '1' : '0',
    //     };
    //   } else if (type.fields[key] === Type.Point) {
    //     value = {
    //       type: 'POINT',
    //       // @ts-expect-error: must be an array of numbers
    //       value: rawValue.join(','),
    //     };
    //   } else if (type.fields[key] === Type.Url) {
    //     value = {
    //       type: 'URL',
    //       // @ts-expect-error: must be a URL
    //       value: rawValue.toString(),
    //     };
    //   } else if (type.fields[key] === Type.Date) {
    //     value = {
    //       type: 'TIME',
    //       // @ts-expect-error: must be a Date
    //       value: rawValue.toISOString(),
    //     };
    //   } else if (type.fields[key] === Type.Number) {
    //     value = {
    //       type: 'NUMBER',
    //       // @ts-expect-error: must be a number
    //       value: rawValue.toString(),
    //     };
    //   } else {
    //     value = {
    //       type: 'TEXT',
    //       value: rawValue as string,
    //     };
    //   }
    //   const op = Triple.make({
    //     attributeId: propertyId,
    //     entityId: id,
    //     value,
    //   });
    //   ops.push(op);
    // }

    // for (const [key, relationId] of Object.entries(mappingEntry.relations || {})) {
    //   const relationDiff = diff[key];
    //   if (!relationDiff) {
    //     continue;
    //   }
    //   if (relationDiff.type === 'property') {
    //     throw new Error(`Invalid diff or mapping for generating update Ops on the relation \`${key}\``);
    //   }
    //   for (const toId of relationDiff.addedIds) {
    //     const op = Relation.make({
    //       fromId: Id.Id(id),
    //       toId: Id.Id(toId),
    //       relationTypeId: relationId,
    //     });
    //     ops.push(op);
    //   }
    // }

    return { ops };
  };
}
