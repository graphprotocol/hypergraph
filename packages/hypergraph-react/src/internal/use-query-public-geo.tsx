import { Entity } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { gql, request } from 'graphql-request';
import { useHypergraph } from '../HypergraphSpaceContext.js';
import type { Mapping, MappingEntry } from '../types.js';
import { GEO_ENDPOINT } from './constants.js';
import type { QueryPublicParams } from './types.js';

const entitiesQueryDocument = gql`
query entities($spaceId: String!, $typeId: String!) {
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
          relationsByFromVersionId {
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

    for (const [key, value] of Object.entries(mappingEntry?.relations ?? {})) {
      const property = queryEntityVersion.relationsByFromVersionId.nodes.find((a) => a.typeOf.id === value);
      if (!property) {
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

      const newRelationEntity = {
        id: property.toEntity.id,
        name: property.toEntity.name,
        type: relationMappingEntry.typeIds[0],
        // TODO: should be determined by the actual value
        __deleted: false,
        // TODO: should be determined by the actual value
        __version: '',
      };

      if (rawEntity[key]) {
        rawEntity[key] = [
          // @ts-expect-error TODO: properly access the type.name
          ...rawEntity[key],
          newRelationEntity,
        ];
      } else {
        rawEntity[key] = [newRelationEntity];
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

export const useQueryPublic = <const S extends Entity.AnyNoContext>(type: S, params?: QueryPublicParams) => {
  const { enabled = true } = params ?? {};
  const { space, mapping } = useHypergraph();

  // @ts-expect-error TODO should use the actual type instead of the name in the mapping
  const typeName = type.name;

  const mappingEntry = mapping?.[typeName];
  if (enabled && !mappingEntry) {
    throw new Error(`Mapping entry for ${typeName} not found`);
  }

  const result = useQueryTanstack({
    queryKey: [`entities:geo:${typeName}`],
    queryFn: async () => {
      const result = await request<EntityQueryResult>(GEO_ENDPOINT, entitiesQueryDocument, {
        spaceId: space,
        typeId: mappingEntry?.typeIds[0],
      });
      return result;
    },
    enabled,
  });

  let data: Entity.Entity<S>[] = [];
  let invalidEntities: Record<string, unknown>[] = [];

  if (result.data && mappingEntry) {
    const parsedData = parseResult(result.data, type, mappingEntry, mapping);
    data = parsedData.data;
    invalidEntities = parsedData.invalidEntities;
  }

  return { ...result, data, invalidEntities };
};
