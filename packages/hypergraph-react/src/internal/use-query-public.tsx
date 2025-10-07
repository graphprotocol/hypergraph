import { Graph } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import { Constants } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { gql, request } from 'graphql-request';
import { useMemo } from 'react';
import { convertPropertyValue } from './convert-property-value.js';
import { convertRelations } from './convert-relations.js';
import { getRelationTypeIds } from './get-relation-type-ids.js';
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
      id
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
      id
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
          id
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
      id: string;
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
          id: string;
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

export const parseResult = <S extends Schema.Schema.AnyNoContext>(queryData: EntityQueryResult, type: S) => {
  const schemaWithId = Schema.extend(Schema.Struct({ id: Schema.String }))(type);
  const decode = Schema.decodeUnknownEither(schemaWithId);
  const data: Entity.Entity<S>[] = [];
  const invalidEntities: Record<string, unknown>[] = [];

  for (const queryEntity of queryData.entities) {
    let rawEntity: Record<string, string | boolean | number | unknown[] | Date> = {
      id: queryEntity.id,
    };

    const ast = type.ast as SchemaAST.TypeLiteral;

    for (const prop of ast.propertySignatures) {
      const propType =
        prop.isOptional && SchemaAST.isUnion(prop.type)
          ? (prop.type.types.find((member) => !SchemaAST.isUndefinedKeyword(member)) ?? prop.type)
          : prop.type;

      const result = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(propType);

      if (Option.isSome(result)) {
        const value = queryEntity.valuesList.find((a) => a.propertyId === result.value);
        if (value) {
          const rawValue = convertPropertyValue(value, propType);
          if (rawValue) {
            rawEntity[String(prop.name)] = rawValue;
          }
        }
      }
    }

    rawEntity = {
      ...rawEntity,
      ...convertRelations(queryEntity, ast),
    };

    const decodeResult = decode({
      ...rawEntity,
      __deleted: false,
      // __version: queryEntity.currentVersion.versionId,
      __version: '',
    });

    if (Either.isRight(decodeResult)) {
      // injecting the schema to the entity to be able to access it in the preparePublish function
      data.push({ ...decodeResult.right, __schema: type });
    } else {
      invalidEntities.push(rawEntity);
    }
  }
  return { data, invalidEntities };
};

export const useQueryPublic = <S extends Schema.Schema.AnyNoContext>(type: S, params?: QueryPublicParams<S>) => {
  const { enabled = true, filter, include, space: spaceFromParams, first = 100 } = params ?? {};
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const space = spaceFromParams ?? spaceFromContext;

  // constructing the relation type ids for the query
  const relationTypeIds = getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const result = useQueryTanstack({
    queryKey: [
      'hypergraph-public-entities',
      space,
      typeIds,
      relationTypeIds.level1,
      relationTypeIds.level2,
      filter,
      first,
    ],
    queryFn: async () => {
      let queryDocument = entitiesQueryDocumentLevel0;
      if (relationTypeIds.level1.length > 0) {
        queryDocument = entitiesQueryDocumentLevel1;
      }
      if (relationTypeIds.level2.length > 0) {
        queryDocument = entitiesQueryDocumentLevel2;
      }

      const filterResult = filter ? translateFilterToGraphql(filter, type) : {};
      console.log('filterResult', filterResult);

      const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
        spaceId: space,
        typeIds,
        relationTypeIdsLevel1: relationTypeIds.level1,
        relationTypeIdsLevel2: relationTypeIds.level2,
        first,
        filter: filterResult,
      });
      return result;
    },
    enabled,
  });

  const { data, invalidEntities } = useMemo(() => {
    if (result.data) {
      return parseResult(result.data, type);
    }
    return { data: [], invalidEntities: [] };
  }, [result.data, type]);

  return { ...result, data, invalidEntities };
};
