'use client';

import { queryOptions, type UseQueryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { Array as EffectArray, Order, pipe, Schema } from 'effect';

import { graphqlClient } from '@/clients/Graphql.ts';
import type { PropertiesQuery, SchemaBrowserTypesQuery, TypeSearchQuery } from '@/generated/graphql.ts';
import { graphql } from '@/generated/index.ts';

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

/**
 * notes:
 * 1. e7d737c5-3676-4c60-9fa1-6aa64a8c90ad is the id of the "Type" type. limits the results to type entities
 * 2. using the "typesList" alias to have the return type match the `SchemaBrowserTypesQuery` type for easier re-use
 */
const TypeSearch = graphql(`
  query TypeSearch($query: String!, $first: Int) {
    typesList: search(
      query: $query
      first: $first
      filter: {backlinksExist: true, typeIds: {in: ["e7d737c5-3676-4c60-9fa1-6aa64a8c90ad"]}}
    ) {
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

async function fetchSchemaTypes(query: string | null = null, first = 100) {
  try {
    if (query) {
      return await graphqlClient.request(TypeSearch, { query, first });
    }

    return await graphqlClient.request(SchemaBrowser, { first });
  } catch (_err) {
    console.error('failure fetching schema types');
    return { __typename: 'Query', typesList: [] } satisfies SchemaBrowserTypesQuery | TypeSearchQuery;
  }
}

const Property = Schema.Struct({
  id: Schema.UUID,
  dataType: Schema.Literal('STRING', 'NUMBER', 'BOOLEAN', 'TIME', 'POINT', 'RELATION'),
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

export const schemaBrowserQueryOptions = (
  vars: Readonly<{ query?: string | null | undefined; first?: number | null | undefined }>,
) =>
  queryOptions({
    queryKey: ['Hypergraph', 'Typesync', 'Studio', 'Schema', 'types', vars] as const,
    async queryFn() {
      return await fetchSchemaTypes(vars.query, vars.first || undefined)
        .then((data) => data.typesList ?? [])
        .then((types) =>
          pipe(
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
          ),
        );
    },
  });

export function useSchemaBrowserQuery(
  vars: Readonly<{ query?: string | null | undefined; first?: number | null | undefined }> = {
    query: null,
    first: 100,
  },
  options: Omit<
    UseQueryOptions<
      Array<ExtendedSchemaBrowserType>,
      Error,
      Array<ExtendedSchemaBrowserType>,
      readonly [
        'Hypergraph',
        'Typesync',
        'Studio',
        'Schema',
        'types',
        Readonly<{ query?: string | null | undefined; first?: number | null | undefined }>,
      ]
    >,
    'queryKey' | 'queryFn'
  > = {},
): UseQueryResult<ReadonlyArray<ExtendedSchemaBrowserType>, Error> {
  return useQuery({
    ...schemaBrowserQueryOptions(vars),
    ...options,
  });
}

const PropertyBrowser = graphql(`
  query Properties($query: String, $first: Int) {
    properties(
      first: $first
      filter: {or: [{name: {includesInsensitive: $query}}, {description: {includesInsensitive: $query}}]}
    ) {
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
export async function fetchProperties(query: string | null = null, first = 100) {
  try {
    return await graphqlClient.request(PropertyBrowser, { query, first });
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

export const propertiesQueryOptions = (
  vars: Readonly<{ query?: string | null | undefined; first?: number | null | undefined }>,
) =>
  queryOptions({
    queryKey: ['Hypergraph', 'Typesync', 'Studio', 'Schema', 'properties', vars] as const,
    async queryFn() {
      return await fetchProperties(vars.query, vars.first || undefined)
        .then((data) => data.properties ?? [])
        .then((properties) =>
          pipe(
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
          ),
        );
    },
  });

export function usePropertiesQuery(
  vars: Readonly<{ query?: string | null | undefined; first?: number | null | undefined }> = {
    query: null,
    first: 100,
  },
  options: Omit<
    UseQueryOptions<
      Array<ExtendedProperty>,
      Error,
      Array<ExtendedProperty>,
      readonly [
        'Hypergraph',
        'Typesync',
        'Studio',
        'Schema',
        'properties',
        Readonly<{ query?: string | null | undefined; first?: number | null | undefined }>,
      ]
    >,
    'queryKey' | 'queryFn'
  > = {},
) {
  return useQuery({
    ...propertiesQueryOptions(vars),
    ...options,
  });
}
