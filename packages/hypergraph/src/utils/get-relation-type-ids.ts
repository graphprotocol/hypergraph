import { Constants, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import type { EntityInclude, RelationIncludeBranch, RelationSpacesOverride } from '../entity/types.js';

export type RelationListField = 'relations' | 'backlinks';

export type RelationTypeIdInfo = {
  typeId: string;
  propertyName: string;
  listField: RelationListField;
  includeNodes: boolean;
  includeTotalCount: boolean;
  targetTypeIds?: readonly string[];
  relationSpaces?: RelationSpacesOverride;
  valueSpaces?: RelationSpacesOverride;
  children?: RelationTypeIdInfo[];
};

const isRelationIncludeBranch = (value: unknown): value is RelationIncludeBranch =>
  typeof value === 'object' && value !== null;

const hasTotalCountFlag = (include: Record<string, unknown> | undefined, key: string) =>
  Boolean(include?.[`${key}TotalCount`]);

const getRelationTupleType = (ast: SchemaAST.AST): SchemaAST.TupleType | undefined => {
  if (SchemaAST.isTupleType(ast)) {
    return ast;
  }
  if (SchemaAST.isUnion(ast)) {
    for (const member of ast.types) {
      if (SchemaAST.isTupleType(member)) {
        return member;
      }
    }
  }
  return undefined;
};

const getRelationTargetTypeIds = (relationType: SchemaAST.AST) => {
  const tupleType = getRelationTupleType(relationType);
  if (!tupleType) {
    return undefined;
  }
  const relationTransformation = tupleType.rest[0]?.type;
  if (!relationTransformation || !SchemaAST.isTypeLiteral(relationTransformation)) {
    return undefined;
  }
  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(relationTransformation).pipe(
    Option.getOrElse(() => []),
  );
  return typeIds.length > 0 ? (typeIds as readonly string[]) : undefined;
};

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
      const includeBranchCandidate = include?.[propertyName as keyof EntityInclude<S>];
      const includeBranch = isRelationIncludeBranch(includeBranchCandidate) ? includeBranchCandidate : undefined;
      const includeNodes = Boolean(includeBranch);
      const includeTotalCount = hasTotalCountFlag(include as Record<string, unknown> | undefined, propertyName);

      if (!includeNodes && !includeTotalCount) {
        continue;
      }

      const isBacklink = SchemaAST.getAnnotation<boolean>(Constants.RelationBacklinkSymbol)(prop.type).pipe(
        Option.getOrElse(() => false),
      );
      const listField: RelationListField = isBacklink ? 'backlinks' : 'relations';
      const relationSpaces = includeBranch?._config?.relationSpaces;
      const valueSpaces = includeBranch?._config?.valueSpaces;

      const targetTypeIds = getRelationTargetTypeIds(prop.type);

      const level1InfoBase: RelationTypeIdInfo = {
        typeId: result.value,
        propertyName,
        listField,
        includeNodes,
        includeTotalCount,
        ...(targetTypeIds ? { targetTypeIds } : {}),
      };
      const level1Info: RelationTypeIdInfo =
        relationSpaces === undefined && valueSpaces === undefined
          ? level1InfoBase
          : {
              ...level1InfoBase,
              ...(relationSpaces !== undefined ? { relationSpaces } : {}),
              ...(valueSpaces !== undefined ? { valueSpaces } : {}),
            };
      const nestedRelations: RelationTypeIdInfo[] = [];

      const relationTuple = getRelationTupleType(prop.type);
      if (!relationTuple) {
        relationInfo.push(level1Info);
        continue;
      }
      const relationTransformation = relationTuple.rest[0]?.type;
      if (!relationTransformation || !SchemaAST.isTypeLiteral(relationTransformation)) {
        relationInfo.push(level1Info);
        continue;
      }
      if (!targetTypeIds || targetTypeIds.length === 0) {
        relationInfo.push(level1Info);
        continue;
      }
      if (includeNodes && includeBranch) {
        for (const nestedProp of relationTransformation.propertySignatures) {
          if (!Utils.isRelation(nestedProp.type)) continue;

          const nestedResult = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(nestedProp.type);
          const nestedPropertyName = String(nestedProp.name);
          const nestedIncludeBranchCandidate = includeBranch?.[nestedPropertyName];
          const nestedIncludeBranch = isRelationIncludeBranch(nestedIncludeBranchCandidate)
            ? nestedIncludeBranchCandidate
            : undefined;
          const nestedIncludeNodes = Boolean(nestedIncludeBranch);
          const nestedIncludeTotalCount = hasTotalCountFlag(
            includeBranch as Record<string, unknown> | undefined,
            nestedPropertyName,
          );

          if (Option.isSome(nestedResult) && (nestedIncludeNodes || nestedIncludeTotalCount)) {
            const nestedIsBacklink = SchemaAST.getAnnotation<boolean>(Constants.RelationBacklinkSymbol)(
              nestedProp.type,
            ).pipe(Option.getOrElse(() => false));
            const nestedListField: RelationListField = nestedIsBacklink ? 'backlinks' : 'relations';
            const nestedRelationSpaces = nestedIncludeBranch?._config?.relationSpaces;
            const nestedValueSpaces = nestedIncludeBranch?._config?.valueSpaces;
            const nestedTargetTypeIds = getRelationTargetTypeIds(nestedProp.type);

            const nestedInfoBase: RelationTypeIdInfo = {
              typeId: nestedResult.value,
              propertyName: nestedPropertyName,
              listField: nestedListField,
              includeNodes: nestedIncludeNodes,
              includeTotalCount: nestedIncludeTotalCount,
              ...(nestedTargetTypeIds ? { targetTypeIds: nestedTargetTypeIds } : {}),
            };
            const nestedInfo: RelationTypeIdInfo =
              nestedRelationSpaces === undefined && nestedValueSpaces === undefined
                ? nestedInfoBase
                : {
                    ...nestedInfoBase,
                    ...(nestedRelationSpaces !== undefined ? { relationSpaces: nestedRelationSpaces } : {}),
                    ...(nestedValueSpaces !== undefined ? { valueSpaces: nestedValueSpaces } : {}),
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
