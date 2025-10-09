import { Graph, type Id, type Op, type PropertiesParam, type RelationsParam } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
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
        let serializedValue: string = entity[prop.name];
        if (propertyType.value === 'boolean') {
          serializedValue = Graph.serializeBoolean(entity[prop.name]);
        } else if (propertyType.value === 'date') {
          serializedValue = Graph.serializeDate(entity[prop.name]);
        } else if (propertyType.value === 'point') {
          serializedValue = Graph.serializePoint(entity[prop.name]);
        } else if (propertyType.value === 'number') {
          serializedValue = Graph.serializeNumber(entity[prop.name]);
        }
        values.push({ property: propertyId.value, value: serializedValue });
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
      let existingValue: string | boolean | number | undefined = existingValueEntry?.string;
      let serializedValue: string = entity[prop.name];
      if (propertyType.value === 'boolean') {
        existingValue =
          existingValueEntry?.boolean !== undefined ? Graph.serializeBoolean(existingValueEntry?.boolean) : undefined;
        serializedValue = Graph.serializeBoolean(entity[prop.name]);
      } else if (propertyType.value === 'date') {
        existingValue = existingValueEntry?.time;
        serializedValue = Graph.serializeDate(entity[prop.name]);
      } else if (propertyType.value === 'point') {
        existingValue = existingValueEntry?.point;
        serializedValue = Graph.serializePoint(entity[prop.name]);
      } else if (propertyType.value === 'number') {
        existingValue =
          existingValueEntry?.number !== undefined ? Graph.serializeNumber(existingValueEntry?.number) : undefined;
        serializedValue = Graph.serializeNumber(entity[prop.name]);
      }
      if (existingValue !== serializedValue) {
        values.push({ property: propertyId.value, value: serializedValue });
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
