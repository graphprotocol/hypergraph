import { type Entity, Type } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { gql, request } from 'graphql-request';
import { useMemo } from 'react';
import { useHypergraph } from '../HypergraphSpaceContext.js';
import type { Mapping, MappingEntry } from '../types.js';
import { GEO_API_TESTNET_ENDPOINT } from './constants.js';
import type { QueryPublicParams } from './types.js';

const entitiesQueryDocument = gql`
query entities($spaceId: String!, $typeIds: [String!]!) {
  entities(spaceId: $spaceId, filter: {
    types: { in: $typeIds }
  }) {
    id
    name
    values {
      propertyId
      value
    }
    relations {
      to {
        id
        name
      }
      type {
        id
        entity {
          name
        }
      }
    }
  }
}
`;

type EntityQueryResult = {
  entities: {
    id: string;
    name: string;
    values: {
      propertyId: string;
      value: string;
    }[];
    relations: {
      to: {
        id: string;
        name: string;
      };
      type: {
        id: string;
        entity: {
          name: string;
        };
      };
    }[];
  }[];
};

export const parseResult = <S extends Entity.AnyNoContext>(
  queryData: EntityQueryResult,
  type: S,
  mappingEntry: MappingEntry,
  mapping: Mapping,
) => {
  const decode = Schema.decodeUnknownEither(type);
  const data: Entity.Entity<S>[] = [];
  const invalidEntities: Record<string, unknown>[] = [];

  for (const queryEntity of queryData.entities) {
    const rawEntity: Record<string, string | boolean | number | unknown[] | URL | Date> = {
      id: queryEntity.id,
    };

    // take the mappingEntry and assign the attributes to the rawEntity
    for (const [key, value] of Object.entries(mappingEntry?.properties ?? {})) {
      const property = queryEntity.values.find((a) => a.propertyId === value);
      if (property) {
        if (type.fields[key] === Type.Checkbox) {
          rawEntity[key] = Boolean(property.value);
        } else if (type.fields[key] === Type.Point) {
          rawEntity[key] = property.value;
        } else if (type.fields[key] === Type.Url) {
          rawEntity[key] = property.value;
        } else if (type.fields[key] === Type.Date) {
          rawEntity[key] = property.value;
        } else if (type.fields[key] === Type.Number) {
          rawEntity[key] = Number(property.value);
        } else {
          rawEntity[key] = property.value;
        }
      }
    }

    for (const [key, relationId] of Object.entries(mappingEntry?.relations ?? {})) {
      const properties = queryEntity.relations.filter((a) => a.type.id === relationId);
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

      const newRelationEntities = properties.map((property) => ({
        id: property.to.id,
        name: property.to.name,
        type: property.type.id,
        // TODO: should be determined by the actual value
        __deleted: false,
        // TODO: should be determined by the actual value
        __version: '',
      }));

      if (rawEntity[key]) {
        rawEntity[key] = [
          // @ts-expect-error TODO: properly access the type.name
          ...rawEntity[key],
          ...newRelationEntities,
        ];
      } else {
        rawEntity[key] = newRelationEntities;
      }
    }

    const decodeResult = decode({
      ...rawEntity,
      __deleted: false,
      // __version: queryEntity.currentVersion.versionId,
      __version: '',
    });

    if (Either.isRight(decodeResult)) {
      data.push(decodeResult.right);
    } else {
      invalidEntities.push(rawEntity);
    }
  }
  return { data, invalidEntities };
};

export const useQueryPublic = <S extends Entity.AnyNoContext>(type: S, params?: QueryPublicParams<S>) => {
  const { enabled = true, include } = params ?? {};
  const { space, mapping } = useHypergraph();

  // @ts-expect-error TODO should use the actual type instead of the name in the mapping
  const typeName = type.name;

  const mappingEntry = mapping?.[typeName];
  if (enabled && !mappingEntry) {
    throw new Error(`Mapping entry for ${typeName} not found`);
  }

  const relationTypeIds: string[] = [];
  for (const key in mappingEntry?.relations ?? {}) {
    if (include?.[key] && mappingEntry?.relations?.[key]) {
      relationTypeIds.push(mappingEntry?.relations?.[key]);
    }
  }

  const result = useQueryTanstack({
    queryKey: ['hypergraph-public-entities', typeName, space, mappingEntry?.typeIds],
    queryFn: async () => {
      const result = await request<EntityQueryResult>(GEO_API_TESTNET_ENDPOINT, entitiesQueryDocument, {
        spaceId: space,
        typeIds: mappingEntry?.typeIds || [],
        relationTypeIds,
      });
      return result;
    },
    enabled,
  });

  const { data, invalidEntities } = useMemo(() => {
    if (result.data && mappingEntry) {
      return parseResult(result.data, type, mappingEntry, mapping);
    }
    return { data: [], invalidEntities: [] };
  }, [result.data, type, mappingEntry, mapping]);

  return { ...result, data, invalidEntities };
};
