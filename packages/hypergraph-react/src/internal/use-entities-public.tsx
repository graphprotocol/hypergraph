import { Constants, Entity, Utils } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import type { QueryPublicParams } from './types.js';
import { useHypergraphSpaceInternal } from './use-hypergraph-space-internal.js';

export const useEntitiesPublic = <S extends Schema.Schema.AnyNoContext>(type: S, params?: QueryPublicParams<S>) => {
  const { enabled = true, filter, include, space: spaceFromParams, first = 100 } = params ?? {};
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const space = spaceFromParams ?? spaceFromContext;

  // constructing the relation type ids for the query
  const relationTypeIds = Utils.getRelationTypeIds(type, include);

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const result = useQueryTanstack({
    queryKey: [
      'hypergraph-public-entities',
      space,
      typeIds,
      relationTypeIds.level1,
      relationTypeIds.level2,
      filter,
      first,
    ],
    queryFn: async () => {
      return Entity.findManyPublic(type, { filter, include, space, first });
    },
    enabled,
  });

  return { ...result, data: result.data?.data || [], invalidEntities: result.data?.invalidEntities || [] };
};
