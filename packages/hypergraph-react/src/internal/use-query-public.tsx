import { Graph } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import { PropertyIdSymbol, TypeIdsSymbol } from '@graphprotocol/hypergraph/constants';
import { isRelation } from '@graphprotocol/hypergraph/utils/isRelation';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
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
      const propType = prop.isOptional ? prop.type.types[0] : prop.type;
      const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(propType);

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
      ...convertRelations(queryEntity, type),
    };

    const decodeResult = decode({
      ...rawEntity,
      __deleted: false,
      // __version: queryEntity.currentVersion.versionId,
      __version: '',
    });

    if (Either.isRight(decodeResult)) {
      // TODO: do we need __schema here?
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
  const relationTypeIdsLevel1: string[] = [];
  const relationTypeIdsLevel2: string[] = [];

  const typeIds = SchemaAST.getAnnotation<string[]>(TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const ast = type.ast as SchemaAST.TypeLiteral;

  for (const prop of ast.propertySignatures) {
    if (!isRelation(prop.type)) continue;
    const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);
    if (Option.isSome(result)) {
      relationTypeIdsLevel1.push(result.value);
    }
  }

  // for (const key in mappingEntry?.relations ?? {}) {
  //   if (include?.[key] && mappingEntry?.relations?.[key]) {
  //     relationTypeIdsLevel1.push(mappingEntry?.relations?.[key]);
  //     const field = type.fields[key];
  //     // @ts-expect-error TODO find a better way to access the relation type name
  //     const typeName2 = field.value.name;
  //     const mappingEntry2 = mapping[typeName2];
  //     for (const key2 in mappingEntry2?.relations ?? {}) {
  //       if (include?.[key][key2] && mappingEntry2?.relations?.[key2]) {
  //         relationTypeIdsLevel2.push(mappingEntry2?.relations?.[key2]);
  //       }
  //     }
  //   }
  // }

  const result = useQueryTanstack({
    queryKey: [
      'hypergraph-public-entities',
      'TODO: type name',
      space,
      typeIds,
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
        typeIds,
        relationTypeIdsLevel1,
        relationTypeIdsLevel2,
        first,
        filter: filter ? translateFilterToGraphql(filter, type) : {},
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

// const typeIds = SchemaAST.getAnnotation<string[]>(TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
//   Option.getOrElse(() => []),
// );

// const out: Record<string, unknown> = {};

// for (const prop of ast.propertySignatures) {
//   const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);
//   if (Option.isSome(result)) {
//     const grc20Key = result.value;
//     if (grc20Key in grc20Data && typeof prop.name === 'string') {
//       out[prop.name] = (grc20Data as any)[grc20Key];
//     }
//   }
// }

// out.id = grc20Data.id as string;
