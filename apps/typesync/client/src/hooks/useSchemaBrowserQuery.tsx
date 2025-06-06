'use client';

import { type UseQueryOptions, type UseQueryResult, queryOptions, useQuery } from '@tanstack/react-query';
import { Array as EffectArray, Order, pipe } from 'effect';

import { graphqlClient } from '../clients/graphql.js';
import { ROOT_SPACE_ID } from '../constants.js';
import { graphql } from '../generated/gql.js';
import type { PropertiesQuery, SchemaBrowserTypesQuery } from '../generated/graphql.js';

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

type KGType = NonNullable<SchemaBrowserTypesQuery['types'][number]>;
export type SchemaBrowserType = Omit<KGType, 'properties'> & {
  properties: NonNullable<KGType['properties']>;
};
export type ExtendedSchemaBrowserType = SchemaBrowserType & { slug: string };
const SchemaTypeOrder = Order.mapInput(Order.string, (type: SchemaBrowserType) => type.name || type.id);

export const schemaBrowserQueryOptions = queryOptions({
  queryKey: ['SchemaBrowser', 'types', ROOT_SPACE_ID] as const,
  async queryFn() {
    // fetch schema browser types, filter, sort, and add a slug
    const data = await fetchSchemaTypes();
    const types = data.types ?? [];
    return pipe(
      types,
      EffectArray.filter((type) => type?.name != null && type?.properties != null && type.properties.length > 0),
      EffectArray.filter((type) => type != null),
      EffectArray.map((type) => {
        const slugifiedProps = pipe(
          type.properties ?? [],
          EffectArray.filter((prop) => prop != null),
          EffectArray.reduce('', (slug, curr) => `${slug}${curr.entity?.name || ''}`),
        );
        const slug = `${type.name || ''}${slugifiedProps}`.toLowerCase();
        return {
          ...type,
          properties: type.properties ?? [],
          slug,
        } as const satisfies ExtendedSchemaBrowserType;
      }),
      EffectArray.sort(SchemaTypeOrder),
    );
  },
});

export function useSchemaBrowserQuery(
  options: Omit<
    UseQueryOptions<
      Array<ExtendedSchemaBrowserType>,
      Error,
      Array<ExtendedSchemaBrowserType>,
      readonly ['SchemaBrowser', 'types', typeof ROOT_SPACE_ID]
    >,
    'queryKey' | 'queryFn'
  > = {},
): UseQueryResult<Array<ExtendedSchemaBrowserType>, Error> {
  return useQuery({
    ...schemaBrowserQueryOptions,
    ...options,
  });
}

const PropertyBrowser = graphql(`
  query Properties {
    properties {
      id
      dataType    
      entity {
        name
        description
      }
    }
  }
`);
export async function fetchProperties() {
  try {
    return await graphqlClient.request(PropertyBrowser);
  } catch (err) {
    console.error('failure fetching schema types');
    return { __typename: 'Query', properties: [] } as PropertiesQuery;
  }
}

type KGProperty = NonNullable<PropertiesQuery['properties'][number]>;
export type ExtendedProperty = Omit<KGProperty, 'entity'> & {
  entity: NonNullable<KGProperty['entity']>;
  slug: string;
};

const PropertyNameOrder = Order.mapInput(Order.string, (prop: ExtendedProperty) => prop.entity.name || prop.id);

export const propertiesQueryOptions = queryOptions({
  queryKey: ['SchemaBrowser', 'properties'] as const,
  async queryFn() {
    const data = await fetchProperties();
    const properties = data.properties ?? [];

    return pipe(
      properties,
      EffectArray.filter((prop) => prop != null && prop?.entity?.name != null && prop.dataType != null),
      EffectArray.map((prop) => {
        // biome-ignore lint/style/noNonNullAssertion: null properties are filtered out above
        const _prop = prop!;
        const slug = `${_prop.dataType}${_prop.entity?.name || ''}${_prop.id}`.toLowerCase();

        return {
          id: _prop.id,
          dataType: _prop.dataType,
          // biome-ignore lint/style/noNonNullAssertion: we filter out properties where entity is null above
          entity: _prop.entity!,
          slug,
        } as const satisfies ExtendedProperty;
      }),
      EffectArray.sort(PropertyNameOrder),
    );
  },
});

export function usePropertiesQuery(
  options: Omit<
    UseQueryOptions<Array<ExtendedProperty>, Error, Array<ExtendedProperty>, readonly ['SchemaBrowser', 'properties']>,
    'queryKey' | 'queryFn'
  > = {},
) {
  return useQuery({
    ...propertiesQueryOptions,
    ...options,
  });
}
