import * as Option from 'effect/Option';
import * as SchemaAST from 'effect/SchemaAST';
import { RelationSymbol } from '../entity/internal-new.js';

export const isRelation = (ast: SchemaAST.AST) => {
  return SchemaAST.getAnnotation<boolean>(RelationSymbol)(ast).pipe(Option.getOrElse(() => false));
};
