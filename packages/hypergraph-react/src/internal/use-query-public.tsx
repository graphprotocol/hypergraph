import { Graph } from '@graphprotocol/grc-20';
import { type Entity, type Mapping, store } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import { useSelector } from '@xstate/store/react';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { gql, request } from 'graphql-request';
import { useMemo } from 'react';
import { convertPropertyValue } from './convert-property-value.js';
import { convertRelations } from './convert-relations.js';
import { translateFilterToGraphql } from './translate-filter-to-graphql.js';
import type { QueryPublicParams } from './types.js';
import { useHypergraphSpaceInternal } from './use-hypergraph-space-internal.js';

const entitiesQueryDocumentLevel0 = gql`
query entities($spaceId: UUID!, $typeIds: [UUID!]!, $first: Int, $filter: EntityFilter!) {
  entities(
    filter: { and: [{
      relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
      spaceIds: {in: [$spaceId]},
    }, $filter]}
    first: $first
  ) {
    id
    name
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
      string
      boolean
      number
      time
      point
    }
  }
}
`;

const entitiesQueryDocumentLevel1 = gql`
query entities($spaceId: UUID!, $typeIds: [UUID!]!, $relationTypeIdsLevel1: [UUID!]!, $first: Int, $filter: EntityFilter!) {
  entities(
    first: $first
    filter: { and: [{
    relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
    spaceIds: {in: [$spaceId]},
  }, $filter]}
  ) {
    id
    name
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
      string
      boolean
      number
      time
      point
    }
    relationsList(
      filter: {spaceId: {is: $spaceId}, typeId:{ in: $relationTypeIdsLevel1}},
    ) {
      toEntity {
        id
        name
        valuesList(filter: {spaceId: {is: $spaceId}}) {
          propertyId
          string
          boolean
          number
          time
          point
        }
      }
      typeId
    }
  }
}
`;

const entitiesQueryDocumentLevel2 = gql`
query entities($spaceId: UUID!, $typeIds: [UUID!]!, $relationTypeIdsLevel1: [UUID!]!, $relationTypeIdsLevel2: [UUID!]!, $first: Int, $filter: EntityFilter!) {
  entities(
    first: $first
    filter: { and: [{
    relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
    spaceIds: {in: [$spaceId]},
  }, $filter]}
  ) {
    id
    name
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
      string
      boolean
      number
      time
      point
    }
    relationsList(
      filter: {spaceId: {is: $spaceId}, typeId:{ in: $relationTypeIdsLevel1}},
    ) {
      toEntity {
        id
        name
        valuesList(filter: {spaceId: {is: $spaceId}}) {
          propertyId
          string
          boolean
          number
          time
          point
        }
        relationsList(
          filter: {spaceId: {is: $spaceId}, typeId:{ in: $relationTypeIdsLevel2}},
          # filter: {spaceId: {is: $spaceId}, toEntity: {relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $relationTypeIdsLevel2}}}}}
        ) {
          toEntity {
            id
            name
            valuesList(filter: {spaceId: {is: $spaceId}}) {
              propertyId
              string
              boolean
              number
              time
              point
            }
          }
          typeId
        }
      }
      typeId
    }
  }
}
`;

type EntityQueryResult = {
  entities: {
    id: string;
    name: string;
    valuesList: {
      propertyId: string;
      string: string;
      boolean: boolean;
      number: number;
      time: string;
      point: string;
    }[];
    relationsList: {
      toEntity: {
        id: string;
        name: string;
        valuesList: {
          propertyId: string;
          string: string;
          boolean: boolean;
          number: number;
          time: string;
          point: string;
        }[];
        relationsList: {
          toEntity: {
            id: string;
            name: string;
            valuesList: {
              propertyId: string;
              string: string;
              boolean: boolean;
              number: number;
              time: string;
              point: string;
            }[];
          };
          typeId: string;
        }[];
      };
      typeId: string;
    }[];
  }[];
};

export const parseResult = <S extends Entity.AnyNoContext>(
  queryData: EntityQueryResult,
  type: S,
  mappingEntry: Mapping.MappingEntry,
  mapping: Mapping.Mapping,
) => {
  const decode = Schema.decodeUnknownEither(type);
  const data: Entity.Entity<S>[] = [];
  const invalidEntities: Record<string, unknown>[] = [];

  for (const queryEntity of queryData.entities) {
    let rawEntity: Record<string, string | boolean | number | unknown[] | Date> = {
      id: queryEntity.id,
    };

    // take the mappingEntry and assign the attributes to the rawEntity
    for (const [key, value] of Object.entries(mappingEntry?.properties ?? {})) {
      const property = queryEntity.valuesList.find((a) => a.propertyId === value);
      if (property) {
        rawEntity[key] = convertPropertyValue(property, key, type);
      }
    }

    rawEntity = {
      ...rawEntity,
      ...convertRelations(queryEntity, type, mappingEntry, mapping),
    };

    const decodeResult = decode({
      ...rawEntity,
      __deleted: false,
      // __version: queryEntity.currentVersion.versionId,
      __version: '',
    });

    if (Either.isRight(decodeResult)) {
      data.push({ ...decodeResult.right, __schema: type });
    } else {
      invalidEntities.push(rawEntity);
    }
  }
  return { data, invalidEntities };
};

export const useQueryPublic = <S extends Entity.AnyNoContext>(type: S, params?: QueryPublicParams<S>) => {
  const { enabled = true, filter, include, space: spaceFromParams, first = 100 } = params ?? {};
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const space = spaceFromParams ?? spaceFromContext;
  const mapping = useSelector(store, (state) => state.context.mapping);

  // @ts-expect-error TODO should use the actual type instead of the name in the mapping
  const typeName = type.name;
  const mappingEntry = mapping?.[typeName];
  if (enabled && !mappingEntry) {
    throw new Error(`Mapping entry for ${typeName} not found`);
  }

  // constructing the relation type ids for the query
  const relationTypeIdsLevel1: string[] = [];
  const relationTypeIdsLevel2: string[] = [];
  for (const key in mappingEntry?.relations ?? {}) {
    if (include?.[key] && mappingEntry?.relations?.[key]) {
      relationTypeIdsLevel1.push(mappingEntry?.relations?.[key]);
      const field = type.fields[key];
      // @ts-expect-error TODO find a better way to access the relation type name
      const typeName2 = field.value.name;
      const mappingEntry2 = mapping[typeName2];
      for (const key2 in mappingEntry2?.relations ?? {}) {
        if (include?.[key][key2] && mappingEntry2?.relations?.[key2]) {
          relationTypeIdsLevel2.push(mappingEntry2?.relations?.[key2]);
        }
      }
    }
  }

  const result = useQueryTanstack({
    queryKey: [
      'hypergraph-public-entities',
      typeName,
      space,
      mappingEntry?.typeIds,
      relationTypeIdsLevel1,
      relationTypeIdsLevel2,
      filter,
      first,
    ],
    queryFn: async () => {
      let queryDocument = entitiesQueryDocumentLevel0;
      if (relationTypeIdsLevel1.length > 0) {
        queryDocument = entitiesQueryDocumentLevel1;
      }
      if (relationTypeIdsLevel2.length > 0) {
        queryDocument = entitiesQueryDocumentLevel2;
      }

      const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
        spaceId: space,
        typeIds: mappingEntry?.typeIds || [],
        relationTypeIdsLevel1,
        relationTypeIdsLevel2,
        first,
        filter: filter ? translateFilterToGraphql(filter, type, mapping) : {},
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
