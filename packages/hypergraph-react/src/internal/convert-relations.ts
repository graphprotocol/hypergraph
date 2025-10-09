import { Constants, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { convertPropertyValue } from './convert-property-value.js';

// A recursive representation of the entity structure returned by the public GraphQL
// endpoint. `values` and `relations` are optional because the nested `to` selections
// get slimmer the deeper we traverse in the query. This type intentionally mirrors
// only the fields we actually consume inside `convertRelations`.
type RecursiveQueryEntity = {
  id: string;
  name: string;
  valuesList?: {
    propertyId: string;
    string: string;
    boolean: boolean;
    number: number;
    time: string;
    point: string;
  }[];
  relationsList?: {
    id: string;
    toEntity: RecursiveQueryEntity;
    typeId: string;
  }[];
};

type RawEntityValue = string | boolean | number | unknown[] | Date | { id: string };
type RawEntity = Record<string, RawEntityValue>;
type NestedRawEntity = RawEntity & { _relation: { id: string } };

export const convertRelations = <_S extends Schema.Schema.AnyNoContext>(
  queryEntity: RecursiveQueryEntity,
  ast: SchemaAST.TypeLiteral,
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

      const allRelationsWithTheCorrectPropertyTypeId = queryEntity.relationsList?.filter(
        (a) => a.typeId === result.value,
      );
      if (allRelationsWithTheCorrectPropertyTypeId) {
        for (const relationEntry of allRelationsWithTheCorrectPropertyTypeId) {
          let nestedRawEntity: NestedRawEntity = {
            id: relationEntry.toEntity.id,
            _relation: {
              id: relationEntry.id,
            },
          };

          const relationsForRawNestedEntity = convertRelations(relationEntry.toEntity, relationTransformation);

          nestedRawEntity = {
            ...nestedRawEntity,
            ...relationsForRawNestedEntity,
          };

          for (const nestedProp of relationTransformation.propertySignatures) {
            const nestedResult = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(nestedProp.type);
            if (Option.isSome(nestedResult)) {
              const value = relationEntry.toEntity.valuesList?.find((a) => a.propertyId === nestedResult.value);
              if (!value) {
                continue;
              }
              const rawValue = convertPropertyValue(value, nestedProp.type);
              if (rawValue) {
                nestedRawEntity[String(nestedProp.name)] = rawValue;
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
