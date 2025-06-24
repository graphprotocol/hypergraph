import type { Entity } from '@graphprotocol/hypergraph';
import { store } from '@graphprotocol/hypergraph';
import { useSelector } from '@xstate/store/react';

export function useGenerateCreateOps<const S extends Entity.AnyNoContext>(type: S, enabled = true) {
  const mapping = useSelector(store, (state) => state.context.mapping);

  return (properties: Entity.Entity<S>) => {
    // @ts-expect-error TODO should use the actual type instead of the name in the mapping
    const typeName = type.name;
    const mappingEntry = mapping?.[typeName];
    if (!mappingEntry && enabled) {
      throw new Error(`Mapping entry for ${typeName} not found`);
    }

    if (!enabled || !mappingEntry) {
      return { ops: [] };
    }
    // const fields = type.fields;
    // const grcProperties: PropertiesParam = {};
    // for (const [key, value] of Object.entries(mappingEntry.properties || {})) {
    //   let valueType: ValueType = 'TEXT';
    //   let serializedValue: string = properties[key];
    //   if (fields[key] === Type.Checkbox) {
    //     valueType = 'CHECKBOX';
    //     serializedValue = properties[key] ? '1' : '0';
    //   } else if (fields[key] === Type.Date) {
    //     valueType = 'TIME';
    //     serializedValue = properties[key].toISOString();
    //   } else if (fields[key] === Type.Point) {
    //     valueType = 'POINT';
    //     serializedValue = properties[key].join(',');
    //   } else if (fields[key] === Type.Url) {
    //     valueType = 'URL';
    //     serializedValue = properties[key].toString();
    //   } else if (fields[key] === Type.Number) {
    //     valueType = 'NUMBER';
    //     serializedValue = properties[key].toString();
    //   }

    //   grcProperties[value] = {
    //     type: valueType,
    //     value: serializedValue,
    //   };
    // }

    // for (const [key, relationId] of Object.entries(mappingEntry.relations || {})) {
    //   const toIds: { to: Id.Id; relationId: Id.Id }[] = [];
    //   for (const entity of properties[key]) {
    //     toIds.push({ to: Id.Id(entity.id), relationId: Id.Id(entity._relation.id) });
    //   }
    //   grcProperties[relationId] = toIds;
    // }

    // const { ops, id } = Graph.createEntity({
    //   types: mappingEntry.typeIds,
    //   properties: grcProperties,
    //   id: Id.Id(properties.id),
    // });
    // return { ops, id };
    return { ops: [], id: '' };
  };
}
