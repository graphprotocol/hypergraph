import { Constants, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
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

type RelationsListWithTotalCount = {
  totalCount: number;
} & RelationsListItem[];

// A recursive representation of the entity structure returned by the public GraphQL
// endpoint. `values` and `relations` are optional because the nested `to` selections
// get slimmer the deeper we traverse in the query. This type intentionally mirrors
// only the fields we actually consume inside `convertRelations`.
type RecursiveQueryEntity = {
  id: string;
  name: string;
  valuesList?: ValueList;
  relationsList?: RelationsListItem[];
} & {
  // For aliased relationsList_* fields with proper typing
  [K: `relationsList_${string}`]: RelationsListWithTotalCount;
};

type RawEntityValue = string | boolean | number | unknown[] | Date | { id: string };
type RawEntity = Record<string, RawEntityValue>;
type NestedRawEntity = RawEntity & { _relation: { id: string } & Record<string, RawEntityValue> };

export const convertRelations = <_S extends Schema.Schema.AnyNoContext>(
  queryEntity: RecursiveQueryEntity,
  ast: SchemaAST.TypeLiteral,
  relationInfoLevel1: RelationTypeIdInfo[] = [],
  relationInfoLevel2: RelationTypeIdInfo[] = [],
) => {
  const rawEntity: RawEntity = {};

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

      // Get relations from aliased field if we have relationInfo, otherwise fallback to old behavior
      let allRelationsWithTheCorrectPropertyTypeId: RecursiveQueryEntity['relationsList'];

      if (relationInfoLevel1.length > 0) {
        // Use the aliased field to get relations for this specific type ID
        const alias = getRelationAlias(result.value);
        allRelationsWithTheCorrectPropertyTypeId = queryEntity[
          alias as keyof RecursiveQueryEntity
        ] as RecursiveQueryEntity['relationsList'];
      } else {
        // Fallback to old behavior (filtering from a single relationsList)
        allRelationsWithTheCorrectPropertyTypeId = queryEntity.relationsList?.filter((a) => a.typeId === result.value);
      }

      if (allRelationsWithTheCorrectPropertyTypeId) {
        for (const relationEntry of allRelationsWithTheCorrectPropertyTypeId) {
          let nestedRawEntity: NestedRawEntity = {
            id: relationEntry.toEntity.id,
            _relation: {
              id: relationEntry.id,
            },
          };

          const relationsForRawNestedEntity = convertRelations(
            relationEntry.toEntity,
            relationTransformation,
            relationInfoLevel2,
            [],
          );

          nestedRawEntity = {
            ...nestedRawEntity,
            ...relationsForRawNestedEntity,
          };

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
              if (rawValue) {
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

          // TODO: in the end every entry should be validated using the Schema?!?
          rawEntity[String(prop.name)] = [...(rawEntity[String(prop.name)] as unknown[]), nestedRawEntity];
        }
      }
    }
  }

  return rawEntity;
};
