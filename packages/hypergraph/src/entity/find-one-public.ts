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
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
  logInvalidResults?: boolean | undefined;
};

const buildEntityQuery = (relationInfoLevel1: RelationTypeIdInfo[]) => {
  const relationsSelection = buildRelationsSelection(relationInfoLevel1, 'single');
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
) => {
  if (!queryData.entity) {
    return {
      entity: null,
      invalidEntity: null,
      invalidRelationEntities: [],
    };
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

  const { rawEntity: relationEntities, invalidRelations } = Utils.convertRelations(
    queryEntity,
    ast,
    relationInfoLevel1,
  );
  // @ts-expect-error
  rawEntity = {
    ...rawEntity,
    ...relationEntities,
  };
  const decodeResult = decode({
    ...rawEntity,
    __deleted: false,
  });

  if (Either.isRight(decodeResult)) {
    return {
      entity: { ...decodeResult.right } as Entity.Entity<S>,
      invalidEntity: null,
      invalidRelationEntities: invalidRelations,
    };
  }

  return {
    entity: null,
    invalidEntity: { raw: rawEntity, error: decodeResult.left },
    invalidRelationEntities: invalidRelations,
  };
};

export const findOnePublic = async <S extends Schema.Schema.AnyNoContext>(type: S, params: FindOnePublicParams<S>) => {
  const { id, space, include, logInvalidResults = true } = params;

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const queryDocument = buildEntityQuery(relationTypeIds);

  const result = await request<EntityQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, queryDocument, {
    id,
    spaceId: space,
  });

  const parsed = parseResult(result, type, relationTypeIds);
  if (logInvalidResults) {
    if (parsed.invalidEntity) {
      console.warn('Entity decoding failed', parsed.invalidEntity);
    }
    if (parsed.invalidRelationEntities.length > 0) {
      console.warn('Relation entities where decoding failed were dropped', parsed.invalidRelationEntities);
    }
  }
  return parsed;
};
