import {
  Graph,
  type Id,
  type Op,
  type PropertiesParam,
  type PropertyValueParam,
  type RelationsParam,
} from '@geoprotocol/geo-sdk';
import { Config, Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
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
      text
      boolean
      float
      datetime
      point
      schedule
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
      text: string;
      boolean: boolean;
      float: number;
      datetime: string;
      point: string;
      schedule: string;
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
    `${Config.getApiOrigin()}/graphql`,
    entityToPublishQueryDocument,
    {
      entityId: entity.id,
      spaceId: publicSpace,
    },
  );

  const ops: Op[] = [];
  const values: PropertiesParam = [];
  const relations: RelationsParam = {};
  const type = entity.__schema;
  const ast = type.ast as SchemaAST.TypeLiteral;
  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(ast).pipe(Option.getOrElse(() => []));

  if (data?.entity === null) {
    for (const prop of ast.propertySignatures) {
      const propertyId = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(prop.type);
      const propertyType = SchemaAST.getAnnotation<string>(Constants.PropertyTypeSymbol)(prop.type);
      if (!Option.isSome(propertyId) || !Option.isSome(propertyType)) continue;

      if (Utils.isRelation(prop.type)) {
        // @ts-expect-error any is ok here
        relations[propertyId.value] = entity[prop.name].map((relationEntity) => {
          const newRelation: Record<string, string> = { toEntity: relationEntity.id };
          if (relationEntity._relation.id) {
            newRelation.id = relationEntity._relation.id;
          }
          if (relationEntity._relation.position) {
            newRelation.position = relationEntity._relation.position;
          }
          return newRelation;
        });
      } else {
        if (entity[prop.name] === undefined) {
          if (prop.isOptional) {
            continue;
          }
          throw new Error(`Value for ${String(prop.name)} is undefined`);
        }
        let typedValue: PropertyValueParam;
        if (propertyType.value === 'boolean') {
          typedValue = { property: propertyId.value, type: 'boolean', value: entity[prop.name] as boolean };
        } else if (propertyType.value === 'date') {
          const dateValue = entity[prop.name] as Date;
          typedValue = { property: propertyId.value, type: 'date', value: dateValue.toISOString().split('T')[0] };
        } else if (propertyType.value === 'point') {
          const [lon, lat] = entity[prop.name] as [number, number];
          typedValue = { property: propertyId.value, type: 'point', lon, lat };
        } else if (propertyType.value === 'number') {
          typedValue = { property: propertyId.value, type: 'float', value: entity[prop.name] as number };
        } else {
          // string (text)
          typedValue = { property: propertyId.value, type: 'text', value: entity[prop.name] as string };
        }
        values.push(typedValue);
      }
    }

    const { ops: createOps } = Graph.createEntity({
      id: entity.id,
      types: typeIds,
      values,
      relations,
    });
    ops.push(...createOps);
    return { ops };
  }

  if (!data) {
    return { ops: [] };
  }

  for (const prop of ast.propertySignatures) {
    const propertyId = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(prop.type);
    const propertyType = SchemaAST.getAnnotation<string>(Constants.PropertyTypeSymbol)(prop.type);
    if (!Option.isSome(propertyId) || !Option.isSome(propertyType)) continue;

    if (Utils.isRelation(prop.type)) {
      // TODO: handle added or removed relations
      // TODO: handle updated relations
    } else {
      if (entity[prop.name] === undefined) {
        if (prop.isOptional) {
          continue;
        }
        throw new Error(`Value for ${String(prop.name)} is undefined`);
      }
      const existingValueEntry = data.entity.valuesList.find((value) => value.propertyId === propertyId.value);
      let hasChanged = false;
      let typedValue: PropertyValueParam;

      if (propertyType.value === 'boolean') {
        const newValue = entity[prop.name] as boolean;
        hasChanged = existingValueEntry?.boolean !== newValue;
        typedValue = { property: propertyId.value, type: 'boolean', value: newValue };
      } else if (propertyType.value === 'date') {
        const dateValue = entity[prop.name] as Date;
        const newValue = dateValue.toISOString().split('T')[0];
        hasChanged = existingValueEntry?.datetime !== newValue;
        typedValue = { property: propertyId.value, type: 'date', value: newValue };
      } else if (propertyType.value === 'point') {
        const [lon, lat] = entity[prop.name] as [number, number];
        const newValue = `${lon},${lat}`;
        hasChanged = existingValueEntry?.point !== newValue;
        typedValue = { property: propertyId.value, type: 'point', lon, lat };
      } else if (propertyType.value === 'number') {
        const newValue = entity[prop.name] as number;
        hasChanged = existingValueEntry?.float !== newValue;
        typedValue = { property: propertyId.value, type: 'float', value: newValue };
      } else {
        // string (text)
        const newValue = entity[prop.name] as string;
        hasChanged = existingValueEntry?.text !== newValue;
        typedValue = { property: propertyId.value, type: 'text', value: newValue };
      }

      if (hasChanged) {
        values.push(typedValue);
      }
    }
  }

  // TODO: handle added or removed types
  if (values.length > 0) {
    const { ops: updateEntityOps } = Graph.updateEntity({ id: entity.id, values });
    ops.push(...updateEntityOps);
  }

  return { ops };
};
