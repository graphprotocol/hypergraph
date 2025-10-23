import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { gql, request } from 'graphql-request';
import { useMemo } from 'react';
import { useHypergraphSpaceInternal } from './use-hypergraph-space-internal.js';

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
        relationsList?: {
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
  } | null;
};

export const parseResult = <S extends Schema.Schema.AnyNoContext>(queryData: EntityQueryResult, type: S) => {
  if (!queryData.entity) {
    return { data: null, invalidEntity: null };
  }

  const schemaWithId = Utils.addIdSchemaField(type);
  const decode = Schema.decodeUnknownEither(schemaWithId);
  const queryEntity = queryData.entity;
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
        const rawValue = Utils.convertPropertyValue(value, propType);
        if (rawValue) {
          rawEntity[String(prop.name)] = rawValue;
        }
      }
    }
  }

  // @ts-expect-error
  rawEntity = {
    ...rawEntity,
    ...Utils.convertRelations(queryEntity, ast),
  };

  const decodeResult = decode({
    ...rawEntity,
    __deleted: false,
  });

  if (Either.isRight(decodeResult)) {
    return {
      // injecting the schema to the entity to be able to access it in the preparePublish function
      data: { ...decodeResult.right, __schema: type } as Entity.Entity<S>,
      invalidEntity: null,
    };
  }

  return { data: null, invalidEntity: rawEntity };
};

type UseEntityPublicParams<S extends Schema.Schema.AnyNoContext> = {
  id: string;
  enabled?: boolean;
  space?: string;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
};

export const useEntityPublic = <S extends Schema.Schema.AnyNoContext>(type: S, params: UseEntityPublicParams<S>) => {
  const { id, enabled = true, space: spaceFromParams, include } = params;
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const space = spaceFromParams ?? spaceFromContext;

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const result = useQueryTanstack({
    queryKey: ['hypergraph-public-entity', id, typeIds, space, relationTypeIds.level1, relationTypeIds.level2, include],
    queryFn: async () => {
      let queryDocument = entityQueryDocumentLevel0;
      if (relationTypeIds.level1.length > 0) {
        queryDocument = entityQueryDocumentLevel1;
      }
      if (relationTypeIds.level2.length > 0) {
        queryDocument = entityQueryDocumentLevel2;
      }

      const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
        id,
        spaceId: space,
        relationTypeIdsLevel1: relationTypeIds.level1,
        relationTypeIdsLevel2: relationTypeIds.level2,
      });
      return result;
    },
    enabled: enabled && !!id && !!space,
  });

  const { data, invalidEntity } = useMemo(() => {
    if (result.data) {
      return parseResult(result.data, type);
    }
    return { data: null, invalidEntity: null };
  }, [result.data, type]);

  return { ...result, data, invalidEntity };
};
