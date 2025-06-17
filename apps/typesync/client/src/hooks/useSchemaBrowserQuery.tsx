'use client';

import { type UseQueryOptions, type UseQueryResult, queryOptions, useQuery } from '@tanstack/react-query';
import { Array as EffectArray, Order, Schema, pipe } from 'effect';

import { graphqlClient } from '../clients/graphql.js';
import { ROOT_SPACE_ID } from '../constants.js';
import { graphql } from '../generated/gql.js';
import type { PropertiesQuery, SchemaBrowserTypesQuery } from '../generated/graphql.js';

const SchemaBrowser = graphql(`
  query SchemaBrowserTypes($spaceId: String!, $limit: Int) {
    types(spaceId: $spaceId, limit: $limit) {
      id
      name
      properties {
        id
        dataType
        entity {
          id
          name
        }
        relationValueTypes {
          id
          name
          description
          properties {
            id
            dataType
            entity {
              id
              name
            }
          }
        }
      }
    }
  }
`);

export async function fetchSchemaTypes(spaceId = ROOT_SPACE_ID, limit = 1000) {
  try {
    return await graphqlClient.request(SchemaBrowser, { spaceId, limit });
  } catch (err) {
    console.error('failure fetching schema types');
    return { __typename: 'Query', types: [] } as SchemaBrowserTypesQuery;
  }
}

const Property = Schema.Struct({
  id: Schema.UUID,
  dataType: Schema.Literal('TEXT', 'NUMBER', 'CHECKBOX', 'TIME', 'POINT', 'RELATION'),
  entity: Schema.Struct({
    id: Schema.UUID,
    name: Schema.String,
  }),
});
export const RelationValueType = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
  descrtipion: Schema.NullOr(Schema.String),
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
    EffectArray.reduce('', (slug, curr) => `${slug}${curr.entity?.name || ''}`),
  );
  return `${type.name || ''}${slugifiedProps}`.toLowerCase();
}
async function fetchAndTransformSchemaTypes(): Promise<Array<ExtendedSchemaBrowserType>> {
  const data = await fetchSchemaTypes();
  const types = data.types ?? [];

  return pipe(
    types,
    EffectArray.filter((type) => type != null && type.name != null),
    EffectArray.map((type) => {
      // biome-ignore lint/style/noNonNullAssertion: null types filtered out above
      const _type = type!;
      const properties = pipe(
        _type.properties ?? [],
        EffectArray.filter((prop) => prop != null && prop.entity?.name != null),
        EffectArray.map((prop) => {
          // biome-ignore lint/style/noNonNullAssertion: null properties filtered out
          const _prop = prop!;
          // biome-ignore lint/style/noNonNullAssertion: null properties filtered out
          const _entity = _prop.entity!;

          return {
            id: _prop.id,
            dataType: _prop.dataType,
            entity: {
              id: _entity.id,
              // biome-ignore lint/style/noNonNullAssertion: null properties filtered out
              name: _entity.name!,
            },
            relationValueTypes: pipe(
              _prop.relationValueTypes ?? [],
              EffectArray.filter((t) => t != null && t.name != null),
              EffectArray.map((t) => {
                // biome-ignore lint/style/noNonNullAssertion: null filtered out above
                const _t = t!;
                return {
                  id: _t.id,
                  // biome-ignore lint/style/noNonNullAssertion: null t.name filtered out above
                  name: _t.name!,
                  descrtipion: _t.description || null,
                  properties: pipe(
                    _t.properties ?? [],
                    EffectArray.filter(
                      (relationValueTypeProp) =>
                        relationValueTypeProp != null && relationValueTypeProp.entity?.name != null,
                    ),
                    EffectArray.map((relationValueTypeProp) => ({
                      // biome-ignore lint/style/noNonNullAssertion: null filtered out
                      id: relationValueTypeProp!.id,
                      // biome-ignore lint/style/noNonNullAssertion: null filtered out
                      dataType: relationValueTypeProp!.dataType,
                      entity: {
                        // biome-ignore lint/style/noNonNullAssertion: null filtered out
                        id: relationValueTypeProp!.entity!.id,
                        // biome-ignore lint/style/noNonNullAssertion: null filtered out
                        name: relationValueTypeProp!.entity!.name!,
                      },
                    })),
                  ),
                };
              }),
            ),
          } as const satisfies KnowledgeGraphTypeProperty;
        }),
      );
      const mapped: KnowledgeGraphType = {
        id: _type.id,
        // biome-ignore lint/style/noNonNullAssertion: null type name filtered out above
        name: _type.name!,
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
  queryKey: ['SchemaBrowser', 'types', ROOT_SPACE_ID] as const,
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
        id
        name
        description
      }
      relationValueTypes {
        id
        name
        description
        properties {
          id
          dataType
          entity {
            id
            name
          }
        }
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
export type ExtendedProperty = Omit<KGProperty, 'entity' | 'relationValueTypes'> & {
  entity: NonNullable<KGProperty['entity']>;
  relationValueTypes: NonNullable<KGProperty['relationValueTypes']>;
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
      EffectArray.filter((prop) => prop != null && prop.entity?.name != null && prop.dataType != null),
      EffectArray.map((prop) => {
        // biome-ignore lint/style/noNonNullAssertion: null properties are filtered out above
        const _prop = prop!;
        // biome-ignore lint/style/noNonNullAssertion: null properties are filtered out above
        const _entity = _prop.entity!;
        const slug = `${_prop.dataType}${_entity.name || ''}${_prop.id}`.toLowerCase();

        return {
          id: _prop.id,
          dataType: _prop.dataType,
          entity: _entity,
          relationValueTypes: _prop.relationValueTypes ?? [],
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
