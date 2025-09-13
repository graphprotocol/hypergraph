import type { Entity, Mapping } from '@graphprotocol/hypergraph';
import { convertPropertyValue } from './convert-property-value.js';

// A recursive representation of the entity structure returned by the public GraphQL
// endpoint. `values` and `relations` are optional because the nested `to` selections
// get slimmer the deeper we traverse in the query. This type intentionally mirrors
// only the fields we actually consume inside `convertRelations`.
type RecursiveQueryEntity = {
  id: string;
  name: string;
  valuesList?: {
    propertyId: string;
    string: string;
    boolean: boolean;
    number: number;
    time: string;
    point: string;
  }[];
  relationsList?: {
    toEntity: RecursiveQueryEntity;
    typeId: string;
  }[];
};

export const convertRelations = <S extends Entity.AnyNoContext>(
  queryEntity: RecursiveQueryEntity,
  type: S,
  mappingEntry: Mapping.MappingEntry,
  mapping: Mapping.Mapping,
) => {
  const rawEntity: Record<string, string | boolean | number | unknown[] | Date> = {};

  for (const [key, relationId] of Object.entries(mappingEntry?.relations ?? {})) {
    const properties = (queryEntity.relationsList ?? []).filter((a) => a.typeId === relationId);
    if (properties.length === 0) {
      rawEntity[key] = [] as unknown[];
      continue;
    }

    const field = type.fields[key];
    if (!field) {
      // @ts-expect-error TODO: properly access the type.name
      console.error(`Field ${key} not found in ${type.name}`);
      continue;
    }
    // @ts-expect-error TODO: properly access the type.name
    const annotations = field.ast.rest[0].type.to.annotations;

    // TODO: fix this access using proper effect types
    const relationTypeName =
      annotations[
        Object.getOwnPropertySymbols(annotations).find((sym) => sym.description === 'effect/annotation/Identifier')
      ];

    const relationMappingEntry = mapping[relationTypeName];
    if (!relationMappingEntry) {
      console.error(`Relation mapping entry for ${relationTypeName} not found`);
      continue;
    }

    const newRelationEntities = properties.map((propertyEntry) => {
      // @ts-expect-error TODO: properly access the type.name
      const type = field.value;

      let rawEntity: Record<string, string | boolean | number | unknown[] | Date> = {
        id: propertyEntry.toEntity.id,
        name: propertyEntry.toEntity.name,
        // TODO: should be determined by the actual value
        __deleted: false,
        // TODO: should be determined by the actual value
        __version: '',
      };

      // take the mappingEntry and assign the attributes to the rawEntity
      for (const [key, value] of Object.entries(relationMappingEntry?.properties ?? {})) {
        const property = propertyEntry.toEntity.valuesList?.find((a) => a.propertyId === value);
        if (property) {
          rawEntity[key] = convertPropertyValue(property, key, type);
        }
      }

      rawEntity = {
        ...rawEntity,
        ...convertRelations(propertyEntry.toEntity, type, relationMappingEntry, mapping),
      };

      return rawEntity;
    });

    if (rawEntity[key]) {
      rawEntity[key] = [...(rawEntity[key] as unknown[]), ...newRelationEntities];
    } else {
      rawEntity[key] = newRelationEntities;
    }
  }

  return rawEntity;
};
