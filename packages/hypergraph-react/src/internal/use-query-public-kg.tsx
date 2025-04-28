import { Entity } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { gql, request } from 'graphql-request';
import { useHypergraph } from '../HypergraphSpaceContext.js';
import { KG_ENDPOINT } from './constants.js';
import type { QueryPublicParams } from './types.js';

const entitiesQueryDocument = gql`
query entities($spaceId: String!, $typeIds: [String!]!) {
  entities(spaceId: $spaceId, where: {
    typesContains: $typeIds
  }, first:10) {
    id
    name
    description
    attributes {
      attribute
      value
    }
  }
}
`;

type EntityQueryResult = {
  entities: { id: string; attributes: { attribute: string; value: string }[] }[];
};

export function useQueryPublic<const S extends Entity.AnyNoContext>(type: S, params?: QueryPublicParams<S>) {
  const { enabled = true } = params ?? {};
  const decode = Schema.decodeUnknownEither(type);
  const { space, mapping } = useHypergraph();
  // @ts-expect-error TODO should use the actual type instead of the name in the mapping
  const typeName = type.name;
  const mappingEntry = mapping?.[typeName];
  if (enabled && !mappingEntry) {
    throw new Error(`Mapping entry for ${typeName} not found`);
  }

  const result = useQueryTanstack({
    queryKey: [`entities:${typeName}`],
    queryFn: async () => {
      const result = await request<EntityQueryResult>(KG_ENDPOINT, entitiesQueryDocument, {
        spaceId: space,
        typeIds: mappingEntry?.typeIds,
      });
      return result;
    },
    enabled,
  });

  const data: Entity.Entity<S>[] = [];
  const invalidEntities: Record<string, unknown>[] = [];
  if (result.data) {
    for (const queryEntity of result.data.entities) {
      const rawEntity: Record<string, string | boolean> = {
        id: queryEntity.id,
      };
      // take the mappingEntry and assign the attributes to the rawEntity
      for (const [key, value] of Object.entries(mappingEntry?.properties ?? {})) {
        const property = queryEntity.attributes.find((a) => a.attribute === value);
        if (property) {
          if (type.fields[key] === Entity.Checkbox) {
            rawEntity[key] = property.value === '1';
          } else {
            rawEntity[key] = property.value;
          }
        }
      }
      const decodeResult = decode({ ...rawEntity, __deleted: false, __version: '' });
      if (Either.isRight(decodeResult)) {
        data.push(decodeResult.right);
      } else {
        invalidEntities.push(rawEntity);
      }
    }
  }

  return { ...result, data, invalidEntities };
}
