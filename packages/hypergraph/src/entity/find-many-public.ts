import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { request } from 'graphql-request';
import type { RelationTypeIdInfo } from '../utils/get-relation-type-ids.js';
import { buildRelationsSelection } from '../utils/relation-query-helpers.js';

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
  backlinksTotalCountsTypeId1?: string | undefined;
};

const buildEntitiesQuery = (relationInfoLevel1: RelationTypeIdInfo[], useOrderBy: boolean) => {
  const level1Relations = buildRelationsSelection(relationInfoLevel1);

  const queryName = useOrderBy ? 'entitiesOrderedByProperty' : 'entities';
  const orderByParams = useOrderBy ? '$propertyId: UUID!, $sortDirection: SortOrder!, ' : '';
  const orderByArgs = useOrderBy ? 'propertyId: $propertyId\n    sortDirection: $sortDirection\n    ' : '';

  return `
query ${queryName}($spaceId: UUID!, $typeIds: [UUID!]!, ${orderByParams}$first: Int, $filter: EntityFilter!, $offset: Int, $backlinksTotalCountsTypeId1: UUID, $backlinksTotalCountsTypeId1Present: Boolean!) {
  entities: ${queryName}(
    ${orderByArgs}filter: { and: [{
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
    backlinksTotalCountsTypeId1: backlinks(filter: { spaceId: {is: $spaceId}, fromEntity: { typeIds: { is: [$backlinksTotalCountsTypeId1] } }}) @include(if: $backlinksTotalCountsTypeId1Present) {
      totalCount
    }
    ${level1Relations}
  }
}`;
};

type ValuesList = {
  propertyId: string;
  string: string;
  boolean: boolean;
  number: number;
  time: string;
  point: string;
}[];

type RelationsListItem = {
  id: string;
  entity: {
    valuesList: ValuesList;
  };
  toEntity: {
    id: string;
    name: string;
    valuesList: ValuesList;
  } & {
    // For nested aliased relationsList_* fields at level 2
    [K: `relationsList_${string}`]: RelationsListWithTotalCount;
  };
  typeId: string;
};

type RelationsListWithTotalCount = {
  totalCount: number;
} & RelationsListItem[];

export type EntityQueryResult = {
  entities: ({
    id: string;
    name: string;
    valuesList: ValuesList;
    backlinksTotalCountsTypeId1: {
      totalCount: number;
    } | null;
  } & {
    // For aliased relationsList_* fields - provides proper typing with totalCount
    [K: `relationsList_${string}`]: RelationsListWithTotalCount;
  })[];
};

type GraphSortDirection = 'ASC' | 'DESC';

export const parseResult = <S extends Schema.Schema.AnyNoContext>(
  queryData: EntityQueryResult,
  type: S,
  relationInfoLevel1: RelationTypeIdInfo[],
  relationInfoLevel2: RelationTypeIdInfo[],
) => {
  const schemaWithId = Utils.addIdSchemaField(type);
  const decode = Schema.decodeUnknownEither(schemaWithId);
  const data: (Entity.Entity<S> & { backlinksTotalCountsTypeId1?: number })[] = [];
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
      ...Utils.convertRelations(queryEntity, ast, relationInfoLevel1, relationInfoLevel2),
    };

    const decodeResult = decode({
      ...rawEntity,
      __deleted: false,
    });

    if (Either.isRight(decodeResult)) {
      // injecting the schema to the entity to be able to access it in the preparePublish function
      data.push({
        ...decodeResult.right,
        __schema: type,
        backlinksTotalCountsTypeId1: queryEntity.backlinksTotalCountsTypeId1?.totalCount,
      });
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
  const { filter, include, space, first = 100, offset = 0, orderBy, backlinksTotalCountsTypeId1 } = params ?? {};

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

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

  // Build the query dynamically with aliases for each relation type ID
  const queryDocument = buildEntitiesQuery(relationTypeIds.infoLevel1, Boolean(orderBy));

  const filterParams = filter ? Utils.translateFilterToGraphql(filter, type) : {};

  const queryVariables: Record<string, unknown> = {
    spaceId: space,
    typeIds,
    first,
    filter: filterParams,
    offset,
  };

  if (orderByPropertyId && sortDirection) {
    queryVariables.propertyId = orderByPropertyId;
    queryVariables.sortDirection = sortDirection;
  }

  if (backlinksTotalCountsTypeId1) {
    queryVariables.backlinksTotalCountsTypeId1 = backlinksTotalCountsTypeId1;
    queryVariables.backlinksTotalCountsTypeId1Present = true;
  } else {
    queryVariables.backlinksTotalCountsTypeId1Present = false;
  }

  const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, queryVariables);

  const { data, invalidEntities } = parseResult(result, type, relationTypeIds.infoLevel1, relationTypeIds.infoLevel2);
  return { data, invalidEntities };
};
