import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { request } from 'graphql-request';
import type { RelationTypeIdInfo } from '../utils/get-relation-type-ids.js';
import { buildRelationsSelection } from '../utils/relation-query-helpers.js';
import { type EntityQueryResult, parseResult } from './find-many-public.js';

export type SearchManyPublicParams<S extends Schema.Schema.AnyNoContext> = {
  query: string;
  filter?: Entity.EntityFilter<Schema.Schema.Type<S>> | undefined;
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
  space: string | undefined;
  first?: number | undefined;
  offset?: number | undefined;
};

const buildSearchQuery = (relationInfoLevel1: RelationTypeIdInfo[]) => {
  const relationsSelection = buildRelationsSelection(relationInfoLevel1, 'single');

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
    name
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
      string
      boolean
      number
      time
      point
    }
    ${relationsSelection}
  }
}`;
};

export const searchManyPublic = async <S extends Schema.Schema.AnyNoContext>(
  type: S,
  params?: SearchManyPublicParams<S>,
) => {
  const { query, filter, include, space, first = 100, offset = 0 } = params ?? {};

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const queryDocument = buildSearchQuery(relationTypeIds);

  const filterParams = filter ? Utils.translateFilterToGraphql(filter, type) : {};

  const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
    spaceId: space,
    typeIds,
    query,
    first,
    filter: filterParams,
    offset,
  });

  const { data, invalidEntities, invalidRelationEntities } = parseResult(result, type, relationTypeIds);
  return { data, invalidEntities, invalidRelationEntities };
};
