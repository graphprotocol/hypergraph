import { Entity } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { gql, request } from 'graphql-request';
import { useMemo } from 'react';
import { useHypergraph } from '../HypergraphSpaceContext.js';
import type { Mapping, MappingEntry } from '../types.js';
import { GEO_ENDPOINT } from './constants.js';
import type { QueryPublicParams } from './types.js';

const entitiesQueryDocument = gql`
query entities($spaceId: String!, $typeId: String!, $relationTypeIds: [String!]!) {
  entities(
    filter: {
      currentVersion: {
        version: {
          versionTypes: {some: {type: {entityId: {equalTo: $typeId}}}}
          versionSpaces: {some: {spaceId: {equalTo: $spaceId}}}
        }
      }
    }
  ) {
    nodes {
      id
      name
      currentVersion {
        versionId
        version {
          triples {
            nodes {
              attributeId
              textValue
              booleanValue
              valueType
            }
          }
          relationsByFromVersionId(filter: {typeOfId: {in: $relationTypeIds}}) {
            nodes {
              toEntity {
                nodeId
                id
                name
              }
              typeOf {
                id
                name
              }
            }
          }
        }
      }
    }
  }
}
`;

type EntityQueryResult = {
  entities: {
    nodes: {
      id: string;
      name: string;
      currentVersion: {
        versionId: string;
        version: {
          triples: {
            nodes: {
              attributeId: string;
              textValue: string;
              booleanValue: boolean;
              valueType: 'TEXT' | 'CHECKBOX';
            }[];
          };
          relationsByFromVersionId: {
            nodes: {
              typeOf: {
                name: string;
                id: string;
              };
              toEntity: {
                nodeId: string;
                id: string;
                name: string;
              };
            }[];
          };
        };
      };
    }[];
  };
};

export const parseResult = <S extends Entity.AnyNoContext>(
  queryData: EntityQueryResult,
  type: S,
  mappingEntry: MappingEntry,
  mapping: Mapping,
) => {
  const decode = Schema.decodeUnknownEither(type);
  const data: Entity.Entity<S>[] = [];
  const invalidEntities: Record<string, unknown>[] = [];

  for (const queryEntity of queryData.entities.nodes) {
    const queryEntityVersion = queryEntity.currentVersion.version;
    const rawEntity: Record<string, string | boolean | unknown[]> = {
      id: queryEntity.id,
    };
    // take the mappingEntry and assign the attributes to the rawEntity
    for (const [key, value] of Object.entries(mappingEntry?.properties ?? {})) {
      const property = queryEntityVersion.triples.nodes.find((a) => a.attributeId === value);
      if (property) {
        if (type.fields[key] === Entity.Checkbox) {
          rawEntity[key] = property.booleanValue;
        } else {
          rawEntity[key] = property.textValue;
        }
      }
    }

    for (const [key, relationId] of Object.entries(mappingEntry?.relations ?? {})) {
      const properties = queryEntityVersion.relationsByFromVersionId.nodes.filter((a) => a.typeOf.id === relationId);
      if (properties.length === 0) {
        rawEntity[key] = [] as unknown[];
        continue;
      }

      const field = type.fields[key];
      if (!field) {
        // @ts-expect-error TODO: properly access the type.name
        console.error(`Field ${key} not found in ${type.name}`);
        continue;
      }
      // @ts-expect-error TODO: properly access the type.name
      const annotations = field.ast.rest[0].type.to.annotations;

      // TODO: fix this access using proper effect types
      const relationTypeName =
        annotations[
          Object.getOwnPropertySymbols(annotations).find((sym) => sym.description === 'effect/annotation/Identifier')
        ];

      const relationMappingEntry = mapping[relationTypeName];
      if (!relationMappingEntry) {
        console.error(`Relation mapping entry for ${relationTypeName} not found`);
        continue;
      }

      const newRelationEntities = properties.map((property) => ({
        id: property.toEntity.id,
        name: property.toEntity.name,
        type: relationMappingEntry.typeIds[0],
        // TODO: should be determined by the actual value
        __deleted: false,
        // TODO: should be determined by the actual value
        __version: '',
      }));

      if (rawEntity[key]) {
        rawEntity[key] = [
          // @ts-expect-error TODO: properly access the type.name
          ...rawEntity[key],
          ...newRelationEntities,
        ];
      } else {
        rawEntity[key] = newRelationEntities;
      }
    }

    const decodeResult = decode({
      ...rawEntity,
      __deleted: false,
      __version: queryEntity.currentVersion.versionId,
    });

    if (Either.isRight(decodeResult)) {
      data.push(decodeResult.right);
    } else {
      invalidEntities.push(rawEntity);
    }
  }
  return { data, invalidEntities };
};

export const useQueryPublic = <S extends Entity.AnyNoContext>(type: S, params?: QueryPublicParams<S>) => {
  const { enabled = true, include } = params ?? {};
  const { space, mapping } = useHypergraph();

  // @ts-expect-error TODO should use the actual type instead of the name in the mapping
  const typeName = type.name;

  const mappingEntry = mapping?.[typeName];
  if (enabled && !mappingEntry) {
    throw new Error(`Mapping entry for ${typeName} not found`);
  }

  const relationTypeIds: string[] = [];
  for (const key in mappingEntry?.relations ?? {}) {
    if (include?.[key] && mappingEntry?.relations?.[key]) {
      relationTypeIds.push(mappingEntry?.relations?.[key]);
    }
  }

  const result = useQueryTanstack({
    queryKey: [`entities:geo:${typeName}`],
    queryFn: async () => {
      const result = await request<EntityQueryResult>(GEO_ENDPOINT, entitiesQueryDocument, {
        spaceId: space,
        typeId: mappingEntry?.typeIds[0],
        relationTypeIds,
      });
      return result;
    },
    enabled,
  });

  const { data, invalidEntities } = useMemo(() => {
    if (result.data && mappingEntry) {
      return parseResult(result.data, type, mappingEntry, mapping);
    }
    return { data: [], invalidEntities: [] };
  }, [result.data, type, mappingEntry, mapping]);

  return { ...result, data, invalidEntities };
};
