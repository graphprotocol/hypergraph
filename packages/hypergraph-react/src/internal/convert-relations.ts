import { PropertyIdSymbol, TypeIdsSymbol } from '@graphprotocol/hypergraph/constants';
import { isRelation } from '@graphprotocol/hypergraph/utils/isRelation';
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
    toEntity: RecursiveQueryEntity;
    typeId: string;
  }[];
};

export const convertRelations = <S extends Schema.Schema.AnyNoContext>(queryEntity: RecursiveQueryEntity, type: S) => {
  const rawEntity: Record<string, string | boolean | number | unknown[] | Date> = {};

  const ast = type.ast as SchemaAST.TypeLiteral;

  // console.log('queryEntity', queryEntity);

  for (const prop of ast.propertySignatures) {
    const result = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(prop.type);

    if (isRelation(prop.type)) {
      rawEntity[String(prop.name)] = [];

      if (!queryEntity.valuesList) {
        continue;
      }

      if (Option.isSome(result)) {
        const relationTransformation = prop.type.rest?.[0]?.type;
        const typeIds: string[] = SchemaAST.getAnnotation<string[]>(TypeIdsSymbol)(relationTransformation).pipe(
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
            const nestedRawEntity:
              | Record<string, string | boolean | number | unknown[] | Date>
              | { _relation: { id: string } } = {
              id: relationEntry.toEntity.id,
              _relation: {
                id: 'TODO: relation id',
              },
            };

            for (const nestedProp of relationTransformation.propertySignatures) {
              const nestedResult = SchemaAST.getAnnotation<string>(PropertyIdSymbol)(nestedProp.type);
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
              // TODO: in the end every entry should be validated using the Schema?!?
              rawEntity[String(prop.name)] = [...(rawEntity[String(prop.name)] as unknown[]), nestedRawEntity];
            }
          }
        }
      }
    }
  }

  // for (const [key, relationId] of Object.entries(mappingEntry?.relations ?? {})) {
  //   const properties = (queryEntity.relationsList ?? []).filter((a) => a.typeId === relationId);
  //   if (properties.length === 0) {
  //     rawEntity[key] = [] as unknown[];
  //     continue;
  //   }

  //   const field = type.fields[key];
  //   if (!field) {
  //     // @ts-expect-error TODO: properly access the type.name
  //     console.error(`Field ${key} not found in ${type.name}`);
  //     continue;
  //   }
  //   const relationTransformation = field.ast.rest?.[0];
  //   if (!relationTransformation) {
  //     console.error(`Relation transformation for ${key} not found`);
  //     continue;
  //   }

  //   const identifierAnnotation = SchemaAST.getIdentifierAnnotation(relationTransformation.type.to);
  //   if (Option.isNone(identifierAnnotation)) {
  //     console.error(`Relation identifier for ${key} not found`);
  //     continue;
  //   }

  //   const relationTypeName = identifierAnnotation.value;

  //   const relationMappingEntry = mapping[relationTypeName];
  //   if (!relationMappingEntry) {
  //     console.error(`Relation mapping entry for ${relationTypeName} not found`);
  //     continue;
  //   }

  //   const newRelationEntities = properties.map((propertyEntry) => {
  //     // @ts-expect-error TODO: properly access the type.name
  //     const type = field.value;

  //     let rawEntity: Record<string, string | boolean | number | unknown[] | Date> = {
  //       id: propertyEntry.toEntity.id,
  //       name: propertyEntry.toEntity.name,
  //       // TODO: should be determined by the actual value
  //       __deleted: false,
  //       // TODO: should be determined by the actual value
  //       __version: '',
  //     };

  //     // take the mappingEntry and assign the attributes to the rawEntity
  //     for (const [key, value] of Object.entries(relationMappingEntry?.properties ?? {})) {
  //       const property = propertyEntry.toEntity.valuesList?.find((a) => a.propertyId === value);
  //       if (property) {
  //         rawEntity[key] = convertPropertyValue(property, type);
  //       }
  //     }

  //     rawEntity = {
  //       ...rawEntity,
  //       ...convertRelations(propertyEntry.toEntity, type, relationMappingEntry, mapping),
  //     };

  //     return rawEntity;
  //   });

  //   if (rawEntity[key]) {
  //     rawEntity[key] = [...(rawEntity[key] as unknown[]), ...newRelationEntities];
  //   } else {
  //     rawEntity[key] = newRelationEntities;
  //   }
  // }

  return rawEntity;
};
