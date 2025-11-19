import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { request } from 'graphql-request';
import type { RelationTypeIdInfo } from '../utils/get-relation-type-ids.js';
import { buildRelationsSelection } from '../utils/relation-query-helpers.js';
import type { EntityQueryResult as MultiEntityQueryResult } from './find-many-public.js';

type EntityQueryResult = {
  entity: MultiEntityQueryResult['entities'][number] | null;
};

export type FindOnePublicParams<S extends Schema.Schema.AnyNoContext> = {
  id: string;
  space: string;
  // TODO: for multi-level nesting it should only allow the allowed properties instead of Record<string, Record<string, never>>
  include?: { [K in keyof Schema.Schema.Type<S>]?: Record<string, Record<string, never>> } | undefined;
};

const buildEntityQuery = (relationInfoLevel1: RelationTypeIdInfo[]) => {
  const relationsSelection = buildRelationsSelection(relationInfoLevel1);
  const relationsSelectionBlock = relationsSelection ? `\n    ${relationsSelection}\n` : '';

  return `
query entity($id: UUID!, $spaceId: UUID!) {
  entity(
    id: $id,
  ) {
    id
    name
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
      string
      boolean
      number
      time
      point
    }${relationsSelectionBlock}
  }
}
`;
};

const parseResult = <S extends Schema.Schema.AnyNoContext>(
  queryData: EntityQueryResult,
  type: S,
  relationInfoLevel1: RelationTypeIdInfo[],
  relationInfoLevel2: RelationTypeIdInfo[],
) => {
  if (!queryData.entity) {
    return null;
  }

  const schemaWithId = Utils.addIdSchemaField(type);
  const decode = Schema.decodeUnknownEither(schemaWithId);
  const queryEntity = queryData.entity;
  let rawEntity: Record<string, string | boolean | number | unknown[] | Date> = {
    id: queryEntity.id,
  };

  const ast = type.ast as SchemaAST.TypeLiteral;

  for (const prop of ast.propertySignatures) {
    const propType =
      prop.isOptional && SchemaAST.isUnion(prop.type)
        ? (prop.type.types.find((member) => !SchemaAST.isUndefinedKeyword(member)) ?? prop.type)
        : prop.type;

    const result = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(propType);

    if (Option.isSome(result)) {
      const value = queryEntity.valuesList.find((a) => a.propertyId === result.value);
      if (value) {
        const rawValue = Utils.convertPropertyValue(value, propType);
        if (rawValue) {
          rawEntity[String(prop.name)] = rawValue;
        }
      }
    }
  }

  // @ts-expect-error
  rawEntity = {
    ...rawEntity,
    ...Utils.convertRelations(queryEntity, ast, relationInfoLevel1, relationInfoLevel2),
  };

  const decodeResult = decode({
    ...rawEntity,
    __deleted: false,
  });

  if (Either.isRight(decodeResult)) {
    return { ...decodeResult.right } as Entity.Entity<S>;
  }

  // if (process.env.NODE_ENV !== 'production') {
  console.warn('Invalid entity', rawEntity);
  // }
  throw new Error('Invalid entity');
};

export const findOnePublic = async <S extends Schema.Schema.AnyNoContext>(type: S, params: FindOnePublicParams<S>) => {
  const { id, space, include } = params;

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const queryDocument = buildEntityQuery(relationTypeIds.infoLevel1);

  const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
    id,
    spaceId: space,
  });

  return parseResult(result, type, relationTypeIds.infoLevel1, relationTypeIds.infoLevel2);
};
