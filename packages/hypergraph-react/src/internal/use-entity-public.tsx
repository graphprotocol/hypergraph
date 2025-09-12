import { Graph } from '@graphprotocol/grc-20';
import { type Entity, type Mapping, store, TypeUtils } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import { useSelector } from '@xstate/store/react';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { gql, request } from 'graphql-request';
import { useMemo } from 'react';
import { useHypergraphSpaceInternal } from '../HypergraphSpaceContext.js';

const entityQueryDocumentLevel0 = gql`
query entity($id: UUID!, $spaceId: UUID!) {
  entity(
    id: $id,
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

const entityQueryDocumentLevel1 = gql`
query entity($id: UUID!, $spaceId: UUID!, $relationTypeIdsLevel1: [UUID!]!) {
  entity(
    id: $id,
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

const entityQueryDocumentLevel2 = gql`
query entity($id: UUID!, $spaceId: UUID!, $relationTypeIdsLevel1: [UUID!]!, $relationTypeIdsLevel2: [UUID!]!) {
  entity(
    id: $id,
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
  entity: {
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
    relationsList?: {
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
        relationsList?: {
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
  } | null;
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

export const parseResult = <S extends Entity.AnyNoContext>(
  queryData: EntityQueryResult,
  type: S,
  mappingEntry: Mapping.MappingEntry,
  mapping: Mapping.Mapping,
) => {
  if (!queryData.entity) {
    return { data: null, invalidEntity: null };
  }

  const decode = Schema.decodeUnknownEither(type);
  const queryEntity = queryData.entity;
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
    __version: '',
  });

  console.log({ component: 'parseResult', decodeResult });

  if (Either.isRight(decodeResult)) {
    return {
      data: { ...decodeResult.right, __schema: type } as Entity.Entity<S>,
      invalidEntity: null,
    };
  }

  return { data: null, invalidEntity: rawEntity };
};

type UseEntityPublicParams<S extends Entity.AnyNoContext> = {
  id: string;
  enabled?: boolean;
  space?: string;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
};

export const useEntityPublic = <S extends Entity.AnyNoContext>(type: S, params: UseEntityPublicParams<S>) => {
  const { id, enabled = true, space: spaceFromParams, include } = params;
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
    queryKey: ['hypergraph-public-entity', typeName, id, space, relationTypeIdsLevel1, relationTypeIdsLevel2, include],
    queryFn: async () => {
      let queryDocument = entityQueryDocumentLevel0;
      if (relationTypeIdsLevel1.length > 0) {
        queryDocument = entityQueryDocumentLevel1;
      }
      if (relationTypeIdsLevel2.length > 0) {
        queryDocument = entityQueryDocumentLevel2;
      }

      const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
        id,
        spaceId: space,
        relationTypeIdsLevel1,
        relationTypeIdsLevel2,
      });
      return result;
    },
    enabled: enabled && !!id && !!space,
  });

  const { data, invalidEntity } = useMemo(() => {
    if (result.data && mappingEntry) {
      return parseResult(result.data, type, mappingEntry, mapping);
    }
    return { data: null, invalidEntity: null };
  }, [result.data, type, mappingEntry, mapping]);

  return { ...result, data, invalidEntity };
};
