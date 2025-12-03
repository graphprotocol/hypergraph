import { Constants, Entity } from '@graphprotocol/hypergraph';
import { useInfiniteQuery as useInfiniteQueryTanstack } from '@tanstack/react-query';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import type { QueryPublicParams } from '../internal/types.js';
import { useHypergraphSpaceInternal } from '../internal/use-hypergraph-space-internal.js';

export const useEntitiesPublicInfinite = <S extends Schema.Schema.AnyNoContext>(
  type: S,
  params?: QueryPublicParams<S>,
) => {
  const { enabled = true, filter, include, space: spaceFromParams, spaces, first = 2, offset = 0 } = params ?? {};
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const space = spaceFromParams ?? spaceFromContext;
  const spaceSelectionKey = spaces ?? space;
  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const result = useInfiniteQueryTanstack({
    queryKey: ['hypergraph-public-entities', spaceSelectionKey, typeIds, include, filter, 'infinite'],
    queryFn: async ({ pageParam }) => {
      return Entity.findManyPublic(type, {
        filter,
        include,
        ...(spaces ? { spaces } : { space }),
        first,
        offset: pageParam,
      });
    },
    getNextPageParam: (_lastPage, pages) => {
      return offset + pages.length * first;
    },
    initialPageParam: offset,
    enabled,
  });

  return result;
};
