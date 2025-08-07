import { Graph } from '@graphprotocol/grc-20';
import { type Entity, type Mapping, store, TypeUtils } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import { useSelector } from '@xstate/store/react';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { gql, request } from 'graphql-request';
import { useMemo } from 'react';
import { useHypergraphSpaceInternal } from '../HypergraphSpaceContext.js';
import { translateFilterToGraphql } from './translate-filter-to-graphql.js';
import type { QueryPublicParams } from './types.js';

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

const convertPropertyValue = (
  property: { propertyId: string; string: string; boolean: boolean; number: number; time: string; point: string },
  key: string,
  type: Entity.AnyNoContext,
) => {
  if (TypeUtils.isBooleanOrOptionalBooleanType(type.fields[key]) && property.boolean !== undefined) {
    return Boolean(property.boolean);
  }
  if (TypeUtils.isPointOrOptionalPointType(type.fields[key]) && property.point !== undefined) {
    return property.point;
  }
  if (TypeUtils.isDateOrOptionalDateType(type.fields[key]) && property.time !== undefined) {
    return property.time;
  }
  if (TypeUtils.isNumberOrOptionalNumberType(type.fields[key]) && property.number !== undefined) {
    return Number(property.number);
  }
  return property.string;
};

const convertRelations = <S extends Entity.AnyNoContext>(
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
      rawEntity[key] = [
        // @ts-expect-error TODO: properly access the type.name
        ...rawEntity[key],
        ...newRelationEntities,
      ];
    } else {
      rawEntity[key] = newRelationEntities;
    }
  }

  return rawEntity;
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
