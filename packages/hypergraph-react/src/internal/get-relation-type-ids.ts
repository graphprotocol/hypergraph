import { Constants, Utils } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';

export const getRelationTypeIds = (
  type: Schema.Schema.AnyNoContext,
  include:
    | { [K in keyof Schema.Schema.Type<Schema.Schema.AnyNoContext>]?: Record<string, Record<string, never>> }
    | undefined,
) => {
  const relationTypeIdsLevel1: string[] = [];
  const relationTypeIdsLevel2: string[] = [];

  const ast = type.ast as SchemaAST.TypeLiteral;

  for (const prop of ast.propertySignatures) {
    if (!Utils.isRelation(prop.type)) continue;

    const result = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(prop.type);
    if (Option.isSome(result) && include?.[prop.name]) {
      relationTypeIdsLevel1.push(result.value);
      const relationTransformation = prop.type.rest?.[0]?.type;
      const typeIds2: string[] = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(
        relationTransformation,
      ).pipe(Option.getOrElse(() => []));
      if (typeIds2.length === 0) {
        continue;
      }
      for (const nestedProp of relationTransformation.propertySignatures) {
        if (!Utils.isRelation(nestedProp.type)) continue;

        const nestedResult = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(nestedProp.type);
        if (Option.isSome(nestedResult) && include?.[prop.name][nestedProp.name]) {
          relationTypeIdsLevel2.push(nestedResult.value);
        }
      }
    }
  }

  return {
    level1: relationTypeIdsLevel1,
    level2: relationTypeIdsLevel2,
  };
};
