import { Constants, Utils } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import type * as ParseResult from 'effect/ParseResult';
import * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { convertPropertyValue } from './convert-property-value.js';
import type { RelationTypeIdInfo } from './get-relation-type-ids.js';
import { getRelationAlias } from './relation-query-helpers.js';

type ValueList = {
  propertyId: string;
  string: string;
  boolean: boolean;
  number: number;
  time: string;
  point: string;
}[];

type RelationsListItem = {
  id: string;
  toEntity: RecursiveQueryEntity;
  entity: {
    valuesList?: ValueList;
  };
  typeId: string;
};

export type RelationsListWithNodes = {
  nodes?: RelationsListItem[];
  totalCount?: number;
};

// A recursive representation of the entity structure returned by the public GraphQL
// endpoint. `values` and `relations` are optional because the nested `to` selections
// get slimmer the deeper we traverse in the query. This type intentionally mirrors
// only the fields we actually consume inside `convertRelations`.
type RecursiveQueryEntity = {
  id: string;
  name: string;
  valuesList?: ValueList;
  relations?: RelationsListItem[];
} & {
  // For aliased relations_* fields with proper typing
  [K: `relations_${string}`]: RelationsListWithNodes | undefined;
};

type RawEntityValue = string | boolean | number | unknown[] | Date | { id: string };
type RawEntity = Record<string, RawEntityValue>;
type NestedRawEntity = RawEntity & { _relation: { id: string } & Record<string, RawEntityValue> };

export type InvalidRelationEntity = {
  parentEntityId: string;
  propertyName: string;
  propertyTypeId: string;
  relationId: string;
  relationTypeId: string;
  toEntityId: string;
  raw: NestedRawEntity;
  error: ParseResult.ParseError;
};

type ConvertRelationsResult = {
  rawEntity: RawEntity;
  invalidRelations: InvalidRelationEntity[];
};

export const convertRelations = <_S extends Schema.Schema.AnyNoContext>(
  queryEntity: RecursiveQueryEntity,
  ast: SchemaAST.TypeLiteral,
  relationInfo: RelationTypeIdInfo[] = [],
): ConvertRelationsResult => {
  const rawEntity: RawEntity = {};
  const invalidRelations: InvalidRelationEntity[] = [];

  for (const prop of ast.propertySignatures) {
    const result = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(prop.type);

    if (Utils.isRelation(prop.type) && Option.isSome(result)) {
      rawEntity[String(prop.name)] = [];

      if (!SchemaAST.isTupleType(prop.type)) {
        continue;
      }

      const relationType = prop.type;
      const relationTransformation = relationType.rest[0]?.type;
      if (!relationTransformation || !SchemaAST.isTypeLiteral(relationTransformation)) {
        continue;
      }

      const typeIds: string[] = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(relationTransformation).pipe(
        Option.getOrElse(() => []),
      );
      if (typeIds.length === 0) {
        continue;
      }

      const relationMetadata = relationInfo.find(
        (info) => info.typeId === result.value && info.propertyName === String(prop.name),
      );

      // Get relations from aliased field if we have relationInfo for this property, otherwise fallback to old behavior
      let allRelationsWithTheCorrectPropertyTypeId: RelationsListItem[] | undefined;
      let relationConnection: RelationsListWithNodes | undefined;

      if (relationMetadata) {
        // Use the aliased field to get relations for this specific type ID
        const alias = getRelationAlias(result.value, relationMetadata.targetTypeIds);
        relationConnection = queryEntity[alias as keyof RecursiveQueryEntity] as RelationsListWithNodes | undefined;
        if (relationMetadata.includeNodes) {
          allRelationsWithTheCorrectPropertyTypeId = relationConnection?.nodes;
        }
      }

      const relationSchema = Schema.make(relationTransformation);
      const decodeRelation = Schema.decodeUnknownEither(relationSchema);

      if (allRelationsWithTheCorrectPropertyTypeId) {
        for (const relationEntry of allRelationsWithTheCorrectPropertyTypeId) {
          let nestedRawEntity: NestedRawEntity = {
            id: relationEntry.toEntity.id,
            _relation: {
              id: relationEntry.id,
            },
          };

          const childConversion = convertRelations(
            relationEntry.toEntity,
            relationTransformation,
            relationMetadata?.children ?? [],
          );

          nestedRawEntity = {
            ...nestedRawEntity,
            ...childConversion.rawEntity,
          };
          invalidRelations.push(...childConversion.invalidRelations);

          for (const nestedProp of relationTransformation.propertySignatures) {
            const propType =
              nestedProp.isOptional && SchemaAST.isUnion(nestedProp.type)
                ? (nestedProp.type.types.find((member) => !SchemaAST.isUndefinedKeyword(member)) ?? nestedProp.type)
                : nestedProp.type;

            const nestedResult = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(propType);
            if (Option.isSome(nestedResult)) {
              const value = relationEntry.toEntity.valuesList?.find((a) => a.propertyId === nestedResult.value);
              if (!value) {
                continue;
              }
              const rawValue = convertPropertyValue(value, propType);
              if (rawValue !== undefined) {
                nestedRawEntity[String(nestedProp.name)] = rawValue;
              }
            }
          }

          const relationPropertiesSchema = SchemaAST.getAnnotation<Schema.Schema.AnyNoContext>(
            Constants.RelationPropertiesSymbol,
          )(relationTransformation);
          if (Option.isSome(relationPropertiesSchema)) {
            const relationPropertiesSchemaAst = relationPropertiesSchema.value.ast as SchemaAST.TypeLiteral;
            for (const nestedProp of relationPropertiesSchemaAst.propertySignatures) {
              const propType =
                nestedProp.isOptional && SchemaAST.isUnion(nestedProp.type)
                  ? (nestedProp.type.types.find((member) => !SchemaAST.isUndefinedKeyword(member)) ?? nestedProp.type)
                  : nestedProp.type;

              const nestedResult = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(propType);
              if (Option.isSome(nestedResult)) {
                const value = relationEntry.entity.valuesList?.find((a) => a.propertyId === nestedResult.value);
                if (value) {
                  const rawValue = convertPropertyValue(value, propType);
                  if (rawValue !== undefined) {
                    nestedRawEntity._relation[String(nestedProp.name)] = rawValue;
                  }
                }
              }
            }
          }

          const decodedRelation = decodeRelation(nestedRawEntity);
          if (Either.isRight(decodedRelation)) {
            rawEntity[String(prop.name)] = [...(rawEntity[String(prop.name)] as unknown[]), nestedRawEntity];
          } else {
            invalidRelations.push({
              parentEntityId: queryEntity.id,
              propertyName: String(prop.name),
              propertyTypeId: result.value,
              relationId: relationEntry.id,
              relationTypeId: relationEntry.typeId,
              toEntityId: relationEntry.toEntity.id,
              raw: nestedRawEntity,
              error: decodedRelation.left,
            });
          }
        }
      }

      if (relationMetadata?.includeTotalCount) {
        rawEntity[`${String(prop.name)}TotalCount`] = relationConnection?.totalCount ?? 0;
      }
    }
  }

  return { rawEntity, invalidRelations };
};
