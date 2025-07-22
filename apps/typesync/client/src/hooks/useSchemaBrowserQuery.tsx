'use client';

import { queryOptions, type UseQueryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { Array as EffectArray, Order, pipe, Schema } from 'effect';

import { graphqlClient } from '../clients/graphql.js';
import { graphql } from '../generated/gql.js';
import type { PropertiesQuery, SchemaBrowserTypesQuery } from '../generated/graphql.js';

const SchemaBrowser = graphql(`
  query SchemaBrowserTypes($first: Int) {
    typesList(first: $first) {
      id
      name
      description
      properties {
        id
        name
        dataType
        relationValueTypes {
          id
          name
          description
          properties {
            id
            name
            dataType
          }
        }
      }
    }
  }
`);

export async function fetchSchemaTypes(first = 100) {
  try {
    return await graphqlClient.request(SchemaBrowser, { first });
  } catch (_err) {
    console.error('failure fetching schema types');
    return { __typename: 'Query', types: [] } as SchemaBrowserTypesQuery;
  }
}

const Property = Schema.Struct({
  id: Schema.UUID,
  dataType: Schema.Literal('TEXT', 'NUMBER', 'CHECKBOX', 'TIME', 'POINT', 'RELATION'),
  name: Schema.String,
});
export const RelationValueType = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  properties: Schema.NullOr(Schema.Array(Property)),
});
export type RelationValueType = typeof RelationValueType.Type;
const KnowledgeGraphTypeProperty = Schema.Struct({
  ...Property.fields,
  relationValueTypes: Schema.Array(RelationValueType),
});
export type KnowledgeGraphTypeProperty = typeof KnowledgeGraphTypeProperty.Type;
export const KnowledgeGraphType = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
  properties: Schema.Array(KnowledgeGraphTypeProperty),
});
export type KnowledgeGraphType = typeof KnowledgeGraphType.Type;
export const ExtendedSchemaBrowserType = KnowledgeGraphType.pipe(
  Schema.extend(
    Schema.Struct({
      slug: Schema.NonEmptyTrimmedString,
    }),
  ),
);
export type ExtendedSchemaBrowserType = typeof ExtendedSchemaBrowserType.Type;

const SchemaTypeOrder = Order.mapInput(Order.string, (type: ExtendedSchemaBrowserType) => type.name || type.id);

function slugifyKnowlegeGraphType(type: KnowledgeGraphType): string {
  const slugifiedProps = pipe(
    type.properties ?? [],
    EffectArray.filter((prop) => prop != null),
    EffectArray.reduce('', (slug, curr) => `${slug}${curr.name}`),
  );
  return `${type.name || ''}${slugifiedProps}`.toLowerCase();
}
async function fetchAndTransformSchemaTypes(): Promise<Array<ExtendedSchemaBrowserType>> {
  const data = await fetchSchemaTypes();
  const types = data.typesList ?? [];

  return pipe(
    types,
    EffectArray.filter((type) => type != null && type.name != null),
    EffectArray.map((type) => {
      const properties = pipe(
        type.properties ?? [],
        EffectArray.filter((prop) => prop != null && prop.name != null),
        EffectArray.map(
          (prop) =>
            ({
              id: prop.id,
              dataType: prop.dataType,
              // biome-ignore lint/style/noNonNullAssertion: null prop.name filtered out above
              name: prop.name!,
              relationValueTypes: pipe(
                prop.relationValueTypes ?? [],
                EffectArray.filter((t) => t != null && t.name != null),
                EffectArray.map((t) => {
                  return {
                    id: t.id,
                    // biome-ignore lint/style/noNonNullAssertion: null t.name filtered out above
                    name: t.name!,
                    description: t.description || null,
                    properties: pipe(
                      t.properties ?? [],
                      EffectArray.filter((relationValueTypeProp) => relationValueTypeProp.name != null),
                      EffectArray.map((relationValueTypeProp) => ({
                        id: relationValueTypeProp.id,
                        dataType: relationValueTypeProp.dataType,
                        // biome-ignore lint/style/noNonNullAssertion: null name filtered out above
                        name: relationValueTypeProp.name!,
                      })),
                    ),
                  };
                }),
              ),
            }) as const satisfies KnowledgeGraphTypeProperty,
        ),
      );
      const mapped: KnowledgeGraphType = {
        id: type.id,
        // biome-ignore lint/style/noNonNullAssertion: null type name filtered out above
        name: type.name!,
        properties,
      };
      const slug = slugifyKnowlegeGraphType(mapped);
      return {
        ...mapped,
        slug,
      } satisfies ExtendedSchemaBrowserType;
    }),
    EffectArray.sort(SchemaTypeOrder),
  );
}

export const schemaBrowserQueryOptions = queryOptions({
  queryKey: ['SchemaBrowser', 'types'] as const,
  async queryFn() {
    return await fetchAndTransformSchemaTypes();
  },
});

export function useSchemaBrowserQuery(
  options: Omit<
    UseQueryOptions<
      Array<ExtendedSchemaBrowserType>,
      Error,
      Array<ExtendedSchemaBrowserType>,
      readonly ['SchemaBrowser', 'types']
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
  query Properties($first: Int) {
    properties(first: $first) {
      id
      name
      description
      dataType
      relationValueTypes {
        id
        name
        description
        properties {
          id
          dataType
          name
        }
      }
    }
  }
`);
export async function fetchProperties(first = 100) {
  try {
    return await graphqlClient.request(PropertyBrowser, { first });
  } catch (_err) {
    console.error('failure fetching schema types');
    return { __typename: 'Query', properties: [] } as PropertiesQuery;
  }
}

export const ExtendedProperty = KnowledgeGraphTypeProperty.pipe(
  Schema.extend(
    Schema.Struct({
      description: Schema.NullOr(Schema.NonEmptyTrimmedString),
      slug: Schema.Lowercase,
    }),
  ),
);
export type ExtendedProperty = typeof ExtendedProperty.Type;

const PropertyNameOrder = Order.mapInput(Order.string, (prop: ExtendedProperty) => prop.name || prop.id);

export const propertiesQueryOptions = queryOptions({
  queryKey: ['SchemaBrowser', 'properties'] as const,
  async queryFn() {
    const data = await fetchProperties();
    const properties = data.properties ?? [];

    return pipe(
      properties,
      EffectArray.filter((prop) => prop.name != null),
      EffectArray.map((prop) => {
        const slug = `${prop.dataType}${prop.name || ''}${prop.id}`.toLowerCase();

        const property: ExtendedProperty = {
          id: prop.id,
          dataType: prop.dataType,
          // biome-ignore lint/style/noNonNullAssertion: null prop.name filtered out above
          name: prop.name!,
          description: prop.description || null,
          relationValueTypes: pipe(
            prop.relationValueTypes ?? [],
            EffectArray.filter((t) => t != null && t.name != null),
            EffectArray.map((t) => {
              return {
                id: t.id,
                // biome-ignore lint/style/noNonNullAssertion: null t.name filtered out above
                name: t.name!,
                description: t.description || null,
                properties: pipe(
                  t.properties ?? [],
                  EffectArray.filter((relationValueTypeProp) => relationValueTypeProp.name != null),
                  EffectArray.map((relationValueTypeProp) => ({
                    id: relationValueTypeProp.id,
                    dataType: relationValueTypeProp.dataType,
                    // biome-ignore lint/style/noNonNullAssertion: null name filtered out above
                    name: relationValueTypeProp.name!,
                  })),
                ),
              };
            }),
          ),
          slug,
        };
        return property;
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
