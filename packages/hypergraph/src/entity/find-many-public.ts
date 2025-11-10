import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { gql, request } from 'graphql-request';

export type FindManyPublicParams<S extends Schema.Schema.AnyNoContext> = {
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
  space: string;
  first?: number | undefined;
};

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
          # filter: {spaceId: {is: $spaceId}, toEntity: {relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $relationTypeIdsLevel2}}}}}
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

export const parseResult = <S extends Schema.Schema.AnyNoContext>(queryData: EntityQueryResult, type: S) => {
  const schemaWithId = Utils.addIdSchemaField(type);
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
      // injecting the schema to the entity to be able to access it in the preparePublish function
      data.push({ ...decodeResult.right, __schema: type });
    } else {
      invalidEntities.push(rawEntity);
    }
  }
  return { data, invalidEntities };
};

export const findManyPublic = async <S extends Schema.Schema.AnyNoContext>(
  type: S,
  params?: FindManyPublicParams<S>,
) => {
  const { filter, include, space, first = 100 } = params ?? {};

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  let queryDocument = entitiesQueryDocumentLevel0;
  if (relationTypeIds.level1.length > 0) {
    queryDocument = entitiesQueryDocumentLevel1;
  }
  if (relationTypeIds.level2.length > 0) {
    queryDocument = entitiesQueryDocumentLevel2;
  }

  const filterParams = filter ? Utils.translateFilterToGraphql(filter, type) : {};

  const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
    spaceId: space,
    typeIds,
    relationTypeIdsLevel1: relationTypeIds.level1,
    relationTypeIdsLevel2: relationTypeIds.level2,
    first,
    filter: filterParams,
  });

  const { data, invalidEntities } = parseResult(result, type);
  return { data, invalidEntities };
};
