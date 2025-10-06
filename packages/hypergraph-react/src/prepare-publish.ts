import {
  type EntityRelationParams,
  Graph,
  type Id,
  type Op,
  type PropertiesParam,
  type RelationsParam,
} from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import { store } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';
import request, { gql } from 'graphql-request';

export type PreparePublishParams<S extends Schema.Schema.AnyNoContext> = {
  entity: Entity.Entity<S>;
  publicSpace: string | Id;
};

const entityToPublishQueryDocument = gql`
query entityToPublish($entityId: UUID!, $spaceId: UUID!) {
  entity(id: $entityId) {
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
      string
      boolean
      number
      time
      point
    }
    relationsList(filter: {spaceId: {is: $spaceId}}) {
      id
    }
  }
}
`;

type EntityToPublishQueryResult = {
  entity: {
    valuesList: {
      propertyId: string;
      string: string;
      boolean: boolean;
      number: number;
      time: string;
      point: string;
    }[];
    relationsList: {
      id: string;
    }[];
  };
} | null;

export const preparePublish = async <S extends Schema.Schema.AnyNoContext>({
  entity,
  publicSpace,
}: PreparePublishParams<S>) => {
  const data = await request<EntityToPublishQueryResult>(
    `${Graph.TESTNET_API_ORIGIN}/graphql`,
    entityToPublishQueryDocument,
    {
      entityId: entity.id,
      spaceId: publicSpace,
    },
  );

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
      if (entity[key] === undefined) {
        if (TypeUtils.isOptional(fields[key])) {
          continue;
        }
        throw new Error(`Value for ${key} is undefined`);
      }
      let serializedValue: string = entity[key];
      if (TypeUtils.isBooleanOrOptionalBooleanType(fields[key])) {
        serializedValue = Graph.serializeBoolean(entity[key]);
      } else if (TypeUtils.isDateOrOptionalDateType(fields[key])) {
        serializedValue = Graph.serializeDate(entity[key]);
      } else if (TypeUtils.isPointOrOptionalPointType(fields[key])) {
        serializedValue = Graph.serializePoint(entity[key]);
      } else if (TypeUtils.isNumberOrOptionalNumberType(fields[key])) {
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
      id: entity.id,
      types: mappingEntry.typeIds,
      values,
      relations,
    });
    ops.push(...createOps);
    return { ops };
  }

  if (data?.entity) {
    for (const [key, propertyId] of Object.entries(mappingEntry.properties || {})) {
      if (entity[key] === undefined) {
        if (TypeUtils.isOptional(fields[key])) {
          continue;
        }
        throw new Error(`Value for ${key} is undefined`);
      }

      const existingValueEntry = data.entity.valuesList.find((value) => value.propertyId === propertyId);
      let existingValue = existingValueEntry?.string;
      let serializedValue: string = entity[key];
      if (TypeUtils.isBooleanOrOptionalBooleanType(fields[key])) {
        existingValue =
          existingValueEntry?.boolean !== undefined ? Graph.serializeBoolean(existingValueEntry.boolean) : undefined;
        serializedValue = Graph.serializeBoolean(entity[key]);
      } else if (TypeUtils.isDateOrOptionalDateType(fields[key])) {
        existingValue = existingValueEntry?.time;
        serializedValue = Graph.serializeDate(entity[key]);
      } else if (TypeUtils.isPointOrOptionalPointType(fields[key])) {
        existingValue = existingValueEntry?.point;
        serializedValue = Graph.serializePoint(entity[key]);
      } else if (TypeUtils.isNumberOrOptionalNumberType(fields[key])) {
        existingValue =
          existingValueEntry?.number !== undefined ? Graph.serializeNumber(existingValueEntry.number) : undefined;
        serializedValue = Graph.serializeNumber(entity[key]);
      }

      if (serializedValue !== existingValue) {
        values.push({ property: propertyId, value: serializedValue });
      }
    }

    // TODO: handle added or removed relations
    // TODO: handle updated relations
    // TODO: handle added or removed types
    if (values.length > 0) {
      const { ops: updateEntityOps } = Graph.updateEntity({ id: entity.id, values });
      ops.push(...updateEntityOps);
    }
  }

  return { ops };
};
