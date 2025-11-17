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
  offset?: number | undefined;
  orderBy?:
    | {
        property: keyof Schema.Schema.Type<S>;
        direction: 'asc' | 'desc';
      }
    | undefined;
};

const entitiesQueryDocumentLevel0 = gql`
query entities($spaceId: UUID!, $typeIds: [UUID!]!, $first: Int, $filter: EntityFilter!, $offset: Int) {
  entities(
    filter: { and: [{
      relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
      spaceIds: {in: [$spaceId]},
    }, $filter]}
    first: $first
    offset: $offset
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
query entities($spaceId: UUID!, $typeIds: [UUID!]!, $relationTypeIdsLevel1: [UUID!]!, $first: Int, $filter: EntityFilter!, $offset: Int) {
  entities(
    first: $first
    filter: { and: [{
    relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
    spaceIds: {in: [$spaceId]},
  }, $filter]}
    offset: $offset
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
query entities($spaceId: UUID!, $typeIds: [UUID!]!, $relationTypeIdsLevel1: [UUID!]!, $relationTypeIdsLevel2: [UUID!]!, $first: Int, $filter: EntityFilter!, $offset: Int) {
  entities(
    first: $first
    filter: { and: [{
    relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
    spaceIds: {in: [$spaceId]},
  }, $filter]}
    offset: $offset
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

const entitiesOrderedByPropertyQueryDocumentLevel0 = gql`
query entitiesOrderedByProperty($spaceId: UUID!, $typeIds: [UUID!]!, $first: Int, $filter: EntityFilter!, $offset: Int, $propertyId: UUID!, $sortDirection: SortOrder!) {
  entities: entitiesOrderedByProperty(
    filter: { and: [{
      relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
      spaceIds: {in: [$spaceId]},
    }, $filter]}
    first: $first
    offset: $offset
    propertyId: $propertyId
    sortDirection: $sortDirection
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

const entitiesOrderedByPropertyQueryDocumentLevel1 = gql`
query entitiesOrderedByProperty($spaceId: UUID!, $typeIds: [UUID!]!, $relationTypeIdsLevel1: [UUID!]!, $first: Int, $filter: EntityFilter!, $offset: Int, $propertyId: UUID!, $sortDirection: SortOrder!) {
  entities: entitiesOrderedByProperty(
    first: $first
    filter: { and: [{
    relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
    spaceIds: {in: [$spaceId]},
  }, $filter]}
    offset: $offset
    propertyId: $propertyId
    sortDirection: $sortDirection
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

const entitiesOrderedByPropertyQueryDocumentLevel2 = gql`
query entitiesOrderedByProperty($spaceId: UUID!, $typeIds: [UUID!]!, $relationTypeIdsLevel1: [UUID!]!, $relationTypeIdsLevel2: [UUID!]!, $first: Int, $filter: EntityFilter!, $offset: Int, $propertyId: UUID!, $sortDirection: SortOrder!) {
  entities: entitiesOrderedByProperty(
    first: $first
    filter: { and: [{
    relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
    spaceIds: {in: [$spaceId]},
  }, $filter]}
    offset: $offset
    propertyId: $propertyId
    sortDirection: $sortDirection
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

type GraphSortDirection = 'ASC' | 'DESC';

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
  const { filter, include, space, first = 100, offset = 0, orderBy } = params ?? {};

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const relationLevel = relationTypeIds.level2.length > 0 ? 2 : relationTypeIds.level1.length > 0 ? 1 : 0;

  let orderByPropertyId: string | undefined;
  let sortDirection: GraphSortDirection | undefined;

  if (orderBy) {
    const ast = type.ast as SchemaAST.TypeLiteral;
    const propertySignature = ast.propertySignatures.find((prop) => String(prop.name) === String(orderBy.property));

    if (!propertySignature) {
      throw new Error(`Cannot order by unknown property "${String(orderBy.property)}"`);
    }

    const propertyType =
      propertySignature.isOptional && SchemaAST.isUnion(propertySignature.type)
        ? (propertySignature.type.types.find((member) => !SchemaAST.isUndefinedKeyword(member)) ??
          propertySignature.type)
        : propertySignature.type;

    const propertyIdAnnotation = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(propertyType);

    if (Option.isNone(propertyIdAnnotation)) {
      throw new Error(`Property "${String(orderBy.property)}" is missing a propertyId annotation`);
    }

    orderByPropertyId = propertyIdAnnotation.value;
    sortDirection = orderBy.direction === 'asc' ? 'ASC' : 'DESC';
  }

  const queryDocument =
    relationLevel === 2
      ? orderBy
        ? entitiesOrderedByPropertyQueryDocumentLevel2
        : entitiesQueryDocumentLevel2
      : relationLevel === 1
        ? orderBy
          ? entitiesOrderedByPropertyQueryDocumentLevel1
          : entitiesQueryDocumentLevel1
        : orderBy
          ? entitiesOrderedByPropertyQueryDocumentLevel0
          : entitiesQueryDocumentLevel0;

  const filterParams = filter ? Utils.translateFilterToGraphql(filter, type) : {};

  const queryVariables: Record<string, unknown> = {
    spaceId: space,
    typeIds,
    relationTypeIdsLevel1: relationTypeIds.level1,
    relationTypeIdsLevel2: relationTypeIds.level2,
    first,
    filter: filterParams,
    offset,
  };

  if (orderByPropertyId && sortDirection) {
    queryVariables.propertyId = orderByPropertyId;
    queryVariables.sortDirection = sortDirection;
  }

  const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, queryVariables);

  const { data, invalidEntities } = parseResult(result, type);
  return { data, invalidEntities };
};
