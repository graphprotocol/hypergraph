import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { gql, request } from 'graphql-request';
import { parseResult } from './find-many-public.js';

export type SearchManyPublicParams<S extends Schema.Schema.AnyNoContext> = {
  query: string;
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
  space: string | undefined;
  first?: number | undefined;
};

const searchQueryDocumentLevel0 = gql`
query search($query: String!, $spaceId: UUID!, $typeIds: [UUID!]!, $first: Int, $filter: EntityFilter!) {
  search(
    query: $query
    filter: { and: [{
      typeIds: {in: $typeIds}, 
      spaceIds: {in: [$spaceId]},
    }, $filter]}
    spaceId: $spaceId
    first: $first
    offset: 0
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

const searchQueryDocumentLevel1 = gql`
query search($query: String!, $spaceId: UUID!, $typeIds: [UUID!]!, $relationTypeIdsLevel1: [UUID!]!, $first: Int, $filter: EntityFilter!) {
  search(
    query: $query
    filter: { and: [{
      typeIds: {in: $typeIds}, 
      spaceIds: {in: [$spaceId]},
    }, $filter]}
    spaceId: $spaceId
    first: $first
    offset: 0
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
      entity {
        valuesList(filter: {spaceId: {is: $spaceId}}) {
          propertyId
          string
          boolean
          number
          time
          point
        }
      }
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

const searchQueryDocumentLevel2 = gql`
query search($query: String!, $spaceId: UUID!, $typeIds: [UUID!]!, $relationTypeIdsLevel1: [UUID!]!, $relationTypeIdsLevel2: [UUID!]!, $first: Int, $filter: EntityFilter!) {
  search(
    query: $query
    filter: { and: [{
      typeIds: {in: $typeIds}, 
      spaceIds: {in: [$spaceId]},
    }, $filter]}
    spaceId: $spaceId
    first: $first
    offset: 0
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
      entity {
        valuesList(filter: {spaceId: {is: $spaceId}}) {
          propertyId
          string
          boolean
          number
          time
          point
        }
      }
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
          id
          entity {
            valuesList(filter: {spaceId: {is: $spaceId}}) {
              propertyId
              string
              boolean
              number
              time
              point
            }
          }
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

type SearchQueryResult = {
  search: {
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
      entity: {
        valuesList: {
          propertyId: string;
          string: string;
          boolean: boolean;
          number: number;
          time: string;
          point: string;
        }[];
      };
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
          entity: {
            valuesList: {
              propertyId: string;
              string: string;
              boolean: boolean;
              number: number;
              time: string;
              point: string;
            }[];
          };
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

export const searchManyPublic = async <S extends Schema.Schema.AnyNoContext>(
  type: S,
  params?: SearchManyPublicParams<S>,
) => {
  const { query, filter, include, space, first = 100 } = params ?? {};

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  let queryDocument = searchQueryDocumentLevel0;
  if (relationTypeIds.level1.length > 0) {
    queryDocument = searchQueryDocumentLevel1;
  }
  if (relationTypeIds.level2.length > 0) {
    queryDocument = searchQueryDocumentLevel2;
  }

  const filterParams = filter ? Utils.translateFilterToGraphql(filter, type) : {};

  const result = await request<SearchQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
    spaceId: space,
    typeIds,
    query,
    relationTypeIdsLevel1: relationTypeIds.level1,
    relationTypeIdsLevel2: relationTypeIds.level2,
    first,
    filter: filterParams,
  });

  const { data, invalidEntities } = parseResult({ entities: result.search }, type);
  return { data, invalidEntities };
};
