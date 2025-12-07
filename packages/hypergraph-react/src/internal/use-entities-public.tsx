import { Constants, Entity } from '@graphprotocol/hypergraph';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import type { QueryPublicParams } from './types.js';
import { useHypergraphSpaceInternal } from './use-hypergraph-space-internal.js';

type FindManyPublicResult<S extends Schema.Schema.AnyNoContext, IncludeSpaceIds extends boolean | undefined> = Awaited<
  ReturnType<typeof Entity.findManyPublic<S, IncludeSpaceIds>>
>;

export type UseEntitiesPublicResult<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined,
> = Omit<UseQueryResult<FindManyPublicResult<S, IncludeSpaceIds>, Error>, 'data'> & {
  data: FindManyPublicResult<S, IncludeSpaceIds>['data'];
  invalidEntities: FindManyPublicResult<S, IncludeSpaceIds>['invalidEntities'];
  invalidRelationEntities: FindManyPublicResult<S, IncludeSpaceIds>['invalidRelationEntities'];
};

type UseEntitiesPublicFn = <S extends Schema.Schema.AnyNoContext, IncludeSpaceIds extends boolean | undefined = false>(
  type: S,
  params?: QueryPublicParams<S, IncludeSpaceIds>,
) => UseEntitiesPublicResult<S, IncludeSpaceIds>;

export const useEntitiesPublic: UseEntitiesPublicFn = (type, params) => {
  const {
    enabled = true,
    filter,
    include,
    space: spaceFromParams,
    spaces,
    first = 100,
    offset,
    orderBy,
    includeSpaceIds: includeSpaceIdsParam,
    logInvalidResults = true,
  } = params ?? {};
  const includeSpaceIds = includeSpaceIdsParam ?? false;
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
      includeSpaceIds,
    ],
    queryFn: async () => {
      return Entity.findManyPublic(type, {
        filter,
        include,
        ...(spaces ? { spaces } : { space }),
        first,
        offset,
        orderBy,
        ...(includeSpaceIdsParam !== undefined ? { includeSpaceIds: includeSpaceIdsParam } : {}),
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
