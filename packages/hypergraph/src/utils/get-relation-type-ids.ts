import { Constants, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';

export type RelationListField = 'relationsList' | 'backlinksList';

export type RelationTypeIdInfo = {
  typeId: string;
  propertyName: string;
  listField: RelationListField;
  children?: RelationTypeIdInfo[];
};

export const getRelationTypeIds = (
  type: Schema.Schema.AnyNoContext,
  include:
    | { [K in keyof Schema.Schema.Type<Schema.Schema.AnyNoContext>]?: Record<string, Record<string, never>> }
    | undefined,
) => {
  const relationInfo: RelationTypeIdInfo[] = [];

  const ast = type.ast as SchemaAST.TypeLiteral;

  for (const prop of ast.propertySignatures) {
    if (!Utils.isRelation(prop.type)) continue;

    const result = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(prop.type);
    if (Option.isSome(result) && include?.[String(prop.name)]) {
      const isBacklink = SchemaAST.getAnnotation<boolean>(Constants.RelationBacklinkSymbol)(prop.type).pipe(
        Option.getOrElse(() => false),
      );
      const listField: RelationListField = isBacklink ? 'backlinksList' : 'relationsList';
      const level1Info: RelationTypeIdInfo = {
        typeId: result.value,
        propertyName: String(prop.name),
        listField,
      };
      const nestedRelations: RelationTypeIdInfo[] = [];

      if (!SchemaAST.isTupleType(prop.type)) {
        relationInfo.push(level1Info);
        continue;
      }
      const relationTransformation = prop.type.rest[0]?.type;
      if (!relationTransformation || !SchemaAST.isTypeLiteral(relationTransformation)) {
        relationInfo.push(level1Info);
        continue;
      }
      const typeIds2: string[] = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(
        relationTransformation,
      ).pipe(Option.getOrElse(() => []));
      if (typeIds2.length === 0) {
        relationInfo.push(level1Info);
        continue;
      }
      for (const nestedProp of relationTransformation.propertySignatures) {
        if (!Utils.isRelation(nestedProp.type)) continue;

        const nestedResult = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(nestedProp.type);
        if (Option.isSome(nestedResult) && include?.[String(prop.name)]?.[String(nestedProp.name)]) {
          const nestedIsBacklink = SchemaAST.getAnnotation<boolean>(Constants.RelationBacklinkSymbol)(
            nestedProp.type,
          ).pipe(Option.getOrElse(() => false));
          const nestedListField: RelationListField = nestedIsBacklink ? 'backlinksList' : 'relationsList';
          const nestedInfo: RelationTypeIdInfo = {
            typeId: nestedResult.value,
            propertyName: String(nestedProp.name),
            listField: nestedListField,
          };
          nestedRelations.push(nestedInfo);
        }
      }
      if (nestedRelations.length > 0) {
        level1Info.children = nestedRelations;
      }
      relationInfo.push(level1Info);
    }
  }

  return relationInfo;
};
