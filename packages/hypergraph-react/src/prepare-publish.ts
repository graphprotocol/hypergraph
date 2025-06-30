import {
  type EntityRelationParams,
  Graph,
  type Id,
  type Op,
  type PropertiesParam,
  type RelationsParam,
} from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import { Type, store } from '@graphprotocol/hypergraph';
import request, { gql } from 'graphql-request';
import { GEO_API_TESTNET_ENDPOINT } from './internal/constants.js';

export type PreparePublishParams<S extends Entity.AnyNoContext> = {
  entity: Entity.Entity<S>;
  publicSpace: string | Id.Id;
};

const entityToPublishQueryDocument = gql`
query entityToPublish($entityId: String!, $spaceId: String!) {
  entity(id: $entityId, spaceId: $spaceId) {
    values {
      propertyId
    }
    relations {
      id
    }
  }
}
`;

type EntityToPublishQueryResult = {
  entity: {
    values: {
      propertyId: string;
    }[];
    relations: {
      id: string;
    }[];
  };
} | null;

export const preparePublish = async <S extends Entity.AnyNoContext>({
  entity,
  publicSpace,
}: PreparePublishParams<S>) => {
  const data = await request<EntityToPublishQueryResult>(GEO_API_TESTNET_ENDPOINT, entityToPublishQueryDocument, {
    entityId: entity.id,
    spaceId: publicSpace,
  });

  const mapping = store.getSnapshot().context.mapping;
  const typeName = entity.type;
  const mappingEntry = mapping[typeName];
  if (!mappingEntry) {
    throw new Error(`Mapping entry for ${typeName} not found`);
  }

  const ops: Op[] = [];
  const values: PropertiesParam = [];
  const relations: RelationsParam = {};
  const fields = entity.__schema.fields;

  if (data?.entity === null) {
    for (const [key, propertyId] of Object.entries(mappingEntry.properties || {})) {
      let serializedValue: string = entity[key];
      if (fields[key] === Type.Checkbox) {
        serializedValue = Graph.serializeCheckbox(entity[key]);
      } else if (fields[key] === Type.Date) {
        serializedValue = Graph.serializeDate(entity[key]);
      } else if (fields[key] === Type.Point) {
        serializedValue = Graph.serializePoint(entity[key]);
      } else if (fields[key] === Type.Number) {
        serializedValue = Graph.serializeNumber(entity[key]);
      }
      values.push({ property: propertyId, value: serializedValue });
    }
    for (const [key, relationId] of Object.entries(mappingEntry.relations || {})) {
      // @ts-expect-error - TODO: fix the types error
      relations[relationId] = entity[key].map((relationEntity) => {
        const newRelation: EntityRelationParams = { toEntity: relationEntity.id };
        if (relationEntity._relation.id) {
          newRelation.id = relationEntity._relation.id;
        }
        if (relationEntity._relation.position) {
          newRelation.position = relationEntity._relation.position;
        }
        return newRelation;
      });
    }
    const { ops: createOps } = Graph.createEntity({
      types: mappingEntry.typeIds,
      values,
      relations,
    });
    ops.push(...createOps);
    return { ops };
  }

  // TODO: implement updating an existing entity

  return { ops };
};
