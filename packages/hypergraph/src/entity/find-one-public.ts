import { Config, Constants, type Entity, Utils } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import type * as ParseResult from 'effect/ParseResult';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { request } from 'graphql-request';
import type { RelationTypeIdInfo } from '../utils/get-relation-type-ids.js';
import { buildRelationsSelection } from '../utils/relation-query-helpers.js';
import type { EntityQueryResult as MultiEntityQueryResult } from './find-many-public.js';
import { normalizeSpaceIds } from './internal/normalize-space-ids.js';

type EntityQueryResult = {
  entity: MultiEntityQueryResult['entities'][number] | null;
};

export type FindOnePublicParams<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = boolean | undefined,
> = {
  id: string;
  space: string;
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
  includeSpaceIds?: IncludeSpaceIds;
  logInvalidResults?: boolean | undefined;
};

const buildEntityQuery = (relationInfoLevel1: RelationTypeIdInfo[], includeSpaceIds: boolean) => {
  const relationsSelection = buildRelationsSelection(relationInfoLevel1, 'single');
  const relationsSelectionBlock = relationsSelection ? `\n    ${relationsSelection}\n` : '';
  const spaceIdsSelection = includeSpaceIds ? '\n    spaceIds' : '';
  return `
query entity($id: UUID!, $spaceId: UUID!) {
  entity(
    id: $id,
  ) {
    id
    name${spaceIdsSelection}
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
      text
      boolean
      float
      datetime
      point
      schedule
    }${relationsSelectionBlock}
  }
}
`;
};

type RawEntity = Record<string, string | boolean | number | unknown[] | Date | string[]>;

type ParseResultResult<S extends Schema.Schema.AnyNoContext, IncludeSpaceIds extends boolean | undefined> = {
  entity: Entity.WithSpaceIds<Entity.Entity<S>, IncludeSpaceIds> | null;
  invalidEntity: {
    raw: RawEntity;
    error: ParseResult.ParseError;
  } | null;
  invalidRelationEntities: ReturnType<typeof Utils.convertRelations>['invalidRelations'];
};

const parseResult = <S extends Schema.Schema.AnyNoContext, IncludeSpaceIds extends boolean | undefined>(
  queryData: EntityQueryResult,
  type: S,
  relationInfoLevel1: RelationTypeIdInfo[],
  options?: { includeSpaceIds?: IncludeSpaceIds },
): ParseResultResult<S, IncludeSpaceIds> => {
  const includeSpaceIds = options?.includeSpaceIds;
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
  let rawEntity: RawEntity = {
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
        if (rawValue !== undefined) {
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
    const enrichedEntity = ((): Entity.WithSpaceIds<Entity.Entity<S>, IncludeSpaceIds> => {
      if (!includeSpaceIds) {
        return decodeResult.right as Entity.WithSpaceIds<Entity.Entity<S>, IncludeSpaceIds>;
      }
      return {
        ...decodeResult.right,
        spaceIds: normalizeSpaceIds(queryEntity.spaceIds),
      } as Entity.WithSpaceIds<Entity.Entity<S>, IncludeSpaceIds>;
    })();
    return {
      entity: enrichedEntity,
      invalidEntity: null,
      invalidRelationEntities: invalidRelations,
    };
  }

  const invalidRawEntity = includeSpaceIds
    ? ({ ...rawEntity, spaceIds: normalizeSpaceIds(queryEntity.spaceIds) } as RawEntity)
    : rawEntity;
  return {
    entity: null,
    invalidEntity: {
      raw: invalidRawEntity,
      error: decodeResult.left,
    },
    invalidRelationEntities: invalidRelations,
  };
};

export const findOnePublic = async <
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = false,
>(
  type: S,
  params: FindOnePublicParams<S, IncludeSpaceIds>,
) => {
  const { id, space, include, includeSpaceIds: includeSpaceIdsParam, logInvalidResults = true } = params;
  const includeSpaceIds = includeSpaceIdsParam ?? false;

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const queryDocument = buildEntityQuery(relationTypeIds, includeSpaceIds);

  const result = await request<EntityQueryResult>(`${Config.getApiOrigin()}/v2/graphql`, queryDocument, {
    id,
    spaceId: space,
  });

  const parsed = parseResult<S, IncludeSpaceIds>(
    result,
    type,
    relationTypeIds,
    includeSpaceIdsParam === undefined ? undefined : { includeSpaceIds: includeSpaceIdsParam },
  );
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
