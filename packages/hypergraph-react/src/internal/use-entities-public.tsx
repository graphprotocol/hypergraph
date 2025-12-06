import { Constants, Entity } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import type { QueryPublicParams } from './types.js';
import { useHypergraphSpaceInternal } from './use-hypergraph-space-internal.js';

export const useEntitiesPublic = <S extends Schema.Schema.AnyNoContext>(type: S, params?: QueryPublicParams<S>) => {
  const {
    enabled = true,
    filter,
    include,
    space: spaceFromParams,
    spaces,
    first = 100,
    offset,
    orderBy,
    backlinksTotalCountsTypeId1,
    logInvalidResults = true,
  } = params ?? {};
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const space = spaceFromParams ?? spaceFromContext;
  const spaceSelectionKey = spaces ?? space;
  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const result = useQueryTanstack({
    queryKey: [
      'hypergraph-public-entities',
      spaceSelectionKey,
      typeIds,
      include,
      filter,
      first,
      offset,
      orderBy,
      backlinksTotalCountsTypeId1,
    ],
    queryFn: async () => {
      return Entity.findManyPublic(type, {
        filter,
        include,
        ...(spaces ? { spaces } : { space }),
        first,
        offset,
        orderBy,
        backlinksTotalCountsTypeId1,
        logInvalidResults,
      });
    },
    enabled,
  });

  return {
    ...result,
    data: result.data?.data || [],
    invalidEntities: result.data?.invalidEntities || [],
    invalidRelationEntities: result.data?.invalidRelationEntities || [],
  };
};
