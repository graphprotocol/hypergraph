import { Config, Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { request } from 'graphql-request';
import type { RelationTypeIdInfo } from '../utils/get-relation-type-ids.js';
import { buildRelationsSelection } from '../utils/relation-query-helpers.js';
import { type EntityQueryResult, parseResult } from './find-many-public.js';

export type SearchManyPublicParams<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = boolean | undefined,
> = {
  query: string;
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
  space: string | undefined;
  first?: number | undefined;
  offset?: number | undefined;
  includeSpaceIds?: IncludeSpaceIds;
};

const buildSearchQuery = (relationInfoLevel1: RelationTypeIdInfo[], includeSpaceIds: boolean) => {
  const relationsSelection = buildRelationsSelection(relationInfoLevel1, 'single');
  const spaceIdsSelection = includeSpaceIds ? '\n    spaceIds' : '';

  return `
query searchEntities($query: String!, $spaceId: UUID!, $typeIds: [UUID!]!, $first: Int, $filter: EntityFilter!, $offset: Int) {
  entities: search(
    query: $query
    filter: { and: [{
      typeIds: {in: $typeIds}, 
      spaceIds: {in: [$spaceId]},
    }, $filter]}
    spaceId: $spaceId
    first: $first
    offset: $offset
  ) {
    id
    name${spaceIdsSelection}
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
      text
      boolean
      float
      datetime
      point
      schedule
    }
    ${relationsSelection}
  }
}`;
};

export const searchManyPublic = async <
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = false,
>(
  type: S,
  params?: SearchManyPublicParams<S, IncludeSpaceIds>,
) => {
  const {
    query,
    filter,
    include,
    space,
    first = 100,
    offset = 0,
    includeSpaceIds: includeSpaceIdsParam,
  } = params ?? {};
  const includeSpaceIds = includeSpaceIdsParam ?? false;

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const queryDocument = buildSearchQuery(relationTypeIds, includeSpaceIds);

  const filterParams = filter ? Utils.translateFilterToGraphql(filter, type) : {};

  const result = await request<EntityQueryResult>(`${Config.getApiOrigin()}/graphql`, queryDocument, {
    spaceId: space,
    typeIds,
    query,
    first,
    filter: filterParams,
    offset,
  });

  const { data, invalidEntities, invalidRelationEntities } = parseResult<S, IncludeSpaceIds>(
    result,
    type,
    relationTypeIds,
    includeSpaceIdsParam === undefined ? undefined : { includeSpaceIds: includeSpaceIdsParam },
  );
  return { data, invalidEntities, invalidRelationEntities };
};
