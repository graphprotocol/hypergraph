import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import type * as ParseResult from 'effect/ParseResult';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { request } from 'graphql-request';
import type { InvalidRelationEntity, RelationsListWithNodes } from '../utils/convert-relations.js';
import type { RelationTypeIdInfo } from '../utils/get-relation-type-ids.js';
import { buildRelationsSelection } from '../utils/relation-query-helpers.js';
import { normalizeSpaceIds } from './internal/normalize-space-ids.js';
import type { SpaceSelection } from './internal/space-selection.js';
import { normalizeSpaceSelection } from './internal/space-selection.js';
import type { SpaceSelectionInput } from './types.js';

export type FindManyPublicParams<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = boolean | undefined,
> = SpaceSelectionInput & {
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
  first?: number | undefined;
  offset?: number | undefined;
  orderBy?:
    | {
        property: keyof Schema.Schema.Type<S>;
        direction: 'asc' | 'desc';
      }
    | undefined;
  includeSpaceIds?: IncludeSpaceIds;
  logInvalidResults?: boolean | undefined;
};

const buildEntitiesQuery = (
  relationInfoLevel1: RelationTypeIdInfo[],
  useOrderBy: boolean,
  spaceSelection: SpaceSelection,
  includeSpaceIds: boolean,
) => {
  const level1Relations = buildRelationsSelection(relationInfoLevel1, spaceSelection.mode);
  const spaceIdsSelection = includeSpaceIds ? '\n    spaceIds' : '';

  const queryName = useOrderBy ? 'entitiesOrderedByProperty' : 'entities';
  const variableDefinitions = [
    spaceSelection.mode === 'single'
      ? '$spaceId: UUID!'
      : spaceSelection.mode === 'many'
        ? '$spaceIds: [UUID!]!'
        : undefined,
    '$typeIds: [UUID!]!',
    useOrderBy ? '$propertyId: UUID!' : undefined,
    useOrderBy ? '$sortDirection: SortOrder!' : undefined,
    '$first: Int',
    '$filter: EntityFilter!',
    '$offset: Int',
  ]
    .filter(Boolean)
    .join(', ');

  const orderByArgs = useOrderBy ? 'propertyId: $propertyId\n    sortDirection: $sortDirection\n    ' : '';
  const entitySpaceFilter =
    spaceSelection.mode === 'single'
      ? 'spaceIds: {in: [$spaceId]},'
      : spaceSelection.mode === 'many'
        ? 'spaceIds: {in: $spaceIds},'
        : '';
  const valuesListFilter =
    spaceSelection.mode === 'single'
      ? '(filter: { spaceId: { is: $spaceId } })'
      : spaceSelection.mode === 'many'
        ? '(filter: { spaceId: { in: $spaceIds } })'
        : '';

  return `
query ${queryName}(${variableDefinitions}) {
  entities: ${queryName}(
    ${orderByArgs}filter: { and: [{
      relations: {some: {typeId: {is: "8f151ba4-de20-4e3c-9cb4-99ddf96f48f1"}, toEntityId: {in: $typeIds}}}, 
      ${entitySpaceFilter}
    }, $filter]}
    first: $first
    offset: $offset
  ) {
    id
    name${spaceIdsSelection}
    valuesList${valuesListFilter} {
      propertyId
      string
      boolean
      number
      time
      point
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

type RawEntity = Record<string, string | boolean | number | unknown[] | Date | string[]>;

export type InvalidEntity = {
  raw: RawEntity;
  error: ParseResult.ParseError;
};

export type EntityQueryResult = {
  entities: ({
    id: string;
    name: string;
    spaceIds: readonly (string | null)[] | null;
    valuesList: ValuesList;
  } & {
    // For aliased relations_* fields - provides proper typing with totalCount
    [K: `relations_${string}`]: RelationsListWithNodes | undefined;
  })[];
};

type GraphSortDirection = 'ASC' | 'DESC';

export type FindManyParseResult<S extends Schema.Schema.AnyNoContext, IncludeSpaceIds extends boolean | undefined> = {
  data: Entity.WithSpaceIds<Entity.Entity<S>, IncludeSpaceIds>[];
  invalidEntities: InvalidEntity[];
  invalidRelationEntities: InvalidRelationEntity[];
};

export const parseResult = <S extends Schema.Schema.AnyNoContext, IncludeSpaceIds extends boolean | undefined>(
  queryData: EntityQueryResult,
  type: S,
  relationInfoLevel1: RelationTypeIdInfo[],
  options?: { includeSpaceIds?: IncludeSpaceIds },
): FindManyParseResult<S, IncludeSpaceIds> => {
  const includeSpaceIds = options?.includeSpaceIds ?? false;
  const schemaWithId = Utils.addIdSchemaField(type);
  const decode = Schema.decodeUnknownEither(schemaWithId);
  const data: Entity.WithSpaceIds<Entity.Entity<S>, IncludeSpaceIds>[] = [];
  const invalidEntities: InvalidEntity[] = [];
  const invalidRelationEntities: InvalidRelationEntity[] = [];

  for (const queryEntity of queryData.entities) {
    let rawEntity: RawEntity = {
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

    const { rawEntity: relationEntities, invalidRelations } = Utils.convertRelations(
      queryEntity,
      ast,
      relationInfoLevel1,
    );
    // @ts-expect-error
    rawEntity = {
      ...rawEntity,
      ...relationEntities,
    };
    if (invalidRelations.length > 0) {
      invalidRelationEntities.push(...invalidRelations);
    }

    const decodeResult = decode({
      ...rawEntity,
      __deleted: false,
    });

    if (Either.isRight(decodeResult)) {
      const baseEntity = decodeResult.right;
      const entityWithSpaceIds = (
        includeSpaceIds
          ? {
              ...baseEntity,
              spaceIds: normalizeSpaceIds(queryEntity.spaceIds),
            }
          : baseEntity
      ) as Entity.WithSpaceIds<Entity.Entity<S>, IncludeSpaceIds>;
      data.push(entityWithSpaceIds);
    } else {
      const invalidRawEntity = includeSpaceIds
        ? ({ ...rawEntity, spaceIds: normalizeSpaceIds(queryEntity.spaceIds) } as RawEntity)
        : rawEntity;
      invalidEntities.push({
        raw: invalidRawEntity,
        error: decodeResult.left,
      });
    }
  }
  return { data, invalidEntities, invalidRelationEntities };
};

export const findManyPublic = async <
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = false,
>(
  type: S,
  params?: FindManyPublicParams<S, IncludeSpaceIds>,
) => {
  const {
    filter,
    include,
    space,
    spaces,
    first = 100,
    offset = 0,
    orderBy,
    includeSpaceIds: includeSpaceIdsParam,
    logInvalidResults = true,
  } = params ?? {};
  const includeSpaceIds = includeSpaceIdsParam ?? false;

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
  const spaceSelection = normalizeSpaceSelection(space, spaces);

  // Build the query dynamically with aliases for each relation type ID
  const queryDocument = buildEntitiesQuery(relationTypeIds, Boolean(orderBy), spaceSelection, includeSpaceIds);

  const filterParams = filter ? Utils.translateFilterToGraphql(filter, type) : {};

  const queryVariables: Record<string, unknown> = {
    typeIds,
    first,
    filter: filterParams,
    offset,
  };

  if (spaceSelection.mode === 'single') {
    queryVariables.spaceId = spaceSelection.spaceId;
  } else if (spaceSelection.mode === 'many') {
    queryVariables.spaceIds = spaceSelection.spaceIds;
  }

  if (orderByPropertyId && sortDirection) {
    queryVariables.propertyId = orderByPropertyId;
    queryVariables.sortDirection = sortDirection;
  }

  const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, queryVariables);

  const { data, invalidEntities, invalidRelationEntities } = parseResult<S, IncludeSpaceIds>(
    result,
    type,
    relationTypeIds,
    includeSpaceIdsParam === undefined ? undefined : { includeSpaceIds: includeSpaceIdsParam },
  );
  if (logInvalidResults) {
    if (invalidEntities.length > 0) {
      console.warn('Entities where decoding failed were dropped', invalidEntities);
    }
    if (invalidRelationEntities.length > 0) {
      console.warn('Relation entities where decoding failed were dropped', invalidRelationEntities);
    }
  }
  return { data, invalidEntities, invalidRelationEntities };
};
