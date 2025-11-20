import { Constants, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import type { EntityInclude, RelationIncludeBranch } from '../entity/types.js';

export type RelationListField = 'relations' | 'backlinks';

export type RelationTypeIdInfo = {
  typeId: string;
  propertyName: string;
  listField: RelationListField;
  includeNodes: boolean;
  includeTotalCount: boolean;
  children?: RelationTypeIdInfo[];
};

const isRelationIncludeBranch = (value: unknown): value is RelationIncludeBranch =>
  typeof value === 'object' && value !== null;

const hasTotalCountFlag = (include: Record<string, unknown> | undefined, key: string) =>
  Boolean(include?.[`${key}TotalCount`]);

export const getRelationTypeIds = <S extends Schema.Schema.AnyNoContext>(
  type: S,
  include: EntityInclude<S> | undefined,
) => {
  const relationInfo: RelationTypeIdInfo[] = [];

  const ast = type.ast as SchemaAST.TypeLiteral;

  for (const prop of ast.propertySignatures) {
    if (!Utils.isRelation(prop.type)) continue;

    const result = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(prop.type);
    if (Option.isSome(result)) {
      const propertyName = String(prop.name);
      const includeBranch = include?.[propertyName as keyof EntityInclude<S>] as RelationIncludeBranch | undefined;
      const includeNodes = isRelationIncludeBranch(includeBranch);
      const includeTotalCount = hasTotalCountFlag(include as Record<string, unknown> | undefined, propertyName);

      if (!includeNodes && !includeTotalCount) {
        continue;
      }

      const isBacklink = SchemaAST.getAnnotation<boolean>(Constants.RelationBacklinkSymbol)(prop.type).pipe(
        Option.getOrElse(() => false),
      );
      const listField: RelationListField = isBacklink ? 'backlinks' : 'relations';
      const level1Info: RelationTypeIdInfo = {
        typeId: result.value,
        propertyName,
        listField,
        includeNodes,
        includeTotalCount,
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
      if (includeNodes && includeBranch) {
        for (const nestedProp of relationTransformation.propertySignatures) {
          if (!Utils.isRelation(nestedProp.type)) continue;

          const nestedResult = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(nestedProp.type);
          const nestedPropertyName = String(nestedProp.name);
          const nestedIncludeBranch = includeBranch?.[nestedPropertyName];
          const nestedIncludeNodes = isRelationIncludeBranch(nestedIncludeBranch);
          const nestedIncludeTotalCount = hasTotalCountFlag(
            includeBranch as Record<string, unknown> | undefined,
            nestedPropertyName,
          );

          if (Option.isSome(nestedResult) && (nestedIncludeNodes || nestedIncludeTotalCount)) {
            const nestedIsBacklink = SchemaAST.getAnnotation<boolean>(Constants.RelationBacklinkSymbol)(
              nestedProp.type,
            ).pipe(Option.getOrElse(() => false));
            const nestedListField: RelationListField = nestedIsBacklink ? 'backlinks' : 'relations';
            const nestedInfo: RelationTypeIdInfo = {
              typeId: nestedResult.value,
              propertyName: nestedPropertyName,
              listField: nestedListField,
              includeNodes: nestedIncludeNodes,
              includeTotalCount: nestedIncludeTotalCount,
            };
            nestedRelations.push(nestedInfo);
          }
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
