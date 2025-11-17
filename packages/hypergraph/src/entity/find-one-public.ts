import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { gql, request } from 'graphql-request';

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
        relationsList?: {
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
  } | null;
};

export type FindOnePublicParams<S extends Schema.Schema.AnyNoContext> = {
  id: string;
  space: string;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
};

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

const parseResult = <S extends Schema.Schema.AnyNoContext>(queryData: EntityQueryResult, type: S) => {
  if (!queryData.entity) {
    return null;
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
    return { ...decodeResult.right } as Entity.Entity<S>;
  }

  // if (process.env.NODE_ENV !== 'production') {
  console.warn('Invalid entity', rawEntity);
  // }
  throw new Error('Invalid entity');
};

export const findOnePublic = async <S extends Schema.Schema.AnyNoContext>(type: S, params: FindOnePublicParams<S>) => {
  const { id, space, include } = params;

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const relationLevel = relationTypeIds.level2.length > 0 ? 2 : relationTypeIds.level1.length > 0 ? 1 : 0;

  const queryDocument =
    relationLevel === 2
      ? entityQueryDocumentLevel2
      : relationLevel === 1
        ? entityQueryDocumentLevel1
        : entityQueryDocumentLevel0;

  const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
    id,
    spaceId: space,
    relationTypeIdsLevel1: relationTypeIds.level1,
    relationTypeIdsLevel2: relationTypeIds.level2,
  });

  return parseResult(result, type);
};
