'use client';

import {
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { graphqlClient } from '../clients/graphql.js';
import { ROOT_SPACE_ID } from '../constants.js';
import { graphql } from '../generated/gql.js';
import type { SchemaBrowserTypesQuery } from '../generated/graphql.js';

const SchemaBrowser = graphql(`
  query SchemaBrowserTypes($spaceId: String!) {
    types(spaceId: $spaceId) {
      id
      name
      properties {
        id
        dataType
        entity {
          name
        }
      }
    }
  }
`);

export async function fetchSchemaTypes(spaceId = ROOT_SPACE_ID) {
  try {
    return await graphqlClient.request(SchemaBrowser, { spaceId });
  } catch (err) {
    console.error('failure fetching schema types');
    return { __typename: 'Query', types: [] } as SchemaBrowserTypesQuery;
  }
}

export const schemaBrowserQueryOptions = queryOptions({
  queryKey: ['SchemaBrowser', 'types', ROOT_SPACE_ID] as const,
  async queryFn() {
    return await fetchSchemaTypes();
  },
});

export function useSchemaBrowserQuery(
  options: Omit<
    UseQueryOptions<
      SchemaBrowserTypesQuery,
      Error,
      SchemaBrowserTypesQuery,
      readonly ['SchemaBrowser', 'types', typeof ROOT_SPACE_ID]
    >,
    'queryKey' | 'queryFn'
  > = {},
): UseQueryResult<SchemaBrowserTypesQuery, Error> {
  return useQuery({
    ...schemaBrowserQueryOptions,
    ...options,
  });
}

export function useSuspenseSchemaBrowserQuery(
  options: Omit<
    UseSuspenseQueryOptions<
      SchemaBrowserTypesQuery,
      Error,
      SchemaBrowserTypesQuery,
      readonly ['SchemaBrowser', 'types', typeof ROOT_SPACE_ID]
    >,
    'queryKey' | 'queryFn'
  > = {},
): UseSuspenseQueryResult<SchemaBrowserTypesQuery, Error> {
  return useSuspenseQuery({
    ...schemaBrowserQueryOptions,
    ...options,
  });
}
