import { Constants, Entity } from '@graphprotocol/hypergraph';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { useHypergraphSpaceInternal } from './use-hypergraph-space-internal.js';

type UseEntityPublicParams<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined = boolean | undefined,
> = {
  id: string;
  enabled?: boolean;
  space?: string;
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
  includeSpaceIds?: IncludeSpaceIds;
  logInvalidResults?: boolean;
};

type FindOnePublicResult<S extends Schema.Schema.AnyNoContext, IncludeSpaceIds extends boolean | undefined> = Awaited<
  ReturnType<typeof Entity.findOnePublic<S, IncludeSpaceIds>>
>;

export type UseEntityPublicResult<
  S extends Schema.Schema.AnyNoContext,
  IncludeSpaceIds extends boolean | undefined,
> = Omit<UseQueryResult<FindOnePublicResult<S, IncludeSpaceIds>, Error>, 'data'> & {
  data: FindOnePublicResult<S, IncludeSpaceIds>['entity'];
  invalidEntity: FindOnePublicResult<S, IncludeSpaceIds>['invalidEntity'];
  invalidRelationEntities: FindOnePublicResult<S, IncludeSpaceIds>['invalidRelationEntities'];
};

type UseEntityPublicFn = <S extends Schema.Schema.AnyNoContext, IncludeSpaceIds extends boolean | undefined = false>(
  type: S,
  params: UseEntityPublicParams<S, IncludeSpaceIds>,
) => UseEntityPublicResult<S, IncludeSpaceIds>;

export const useEntityPublic: UseEntityPublicFn = (type, params) => {
  const {
    id,
    enabled = true,
    space: spaceFromParams,
    include,
    includeSpaceIds: includeSpaceIdsParam,
    logInvalidResults = true,
  } = params;
  const includeSpaceIds = includeSpaceIdsParam ?? false;
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const space = spaceFromParams ?? spaceFromContext;

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const result = useQueryTanstack({
    queryKey: ['hypergraph-public-entity', id, typeIds, space, include, includeSpaceIds],
    queryFn: async () => {
      return Entity.findOnePublic(type, {
        id,
        space,
        include,
        ...(includeSpaceIdsParam !== undefined ? { includeSpaceIds: includeSpaceIdsParam } : {}),
        logInvalidResults,
      });
    },
    enabled: enabled && !!id && !!space,
  });

  return {
    ...result,
    data: result.data?.entity ?? null,
    invalidEntity: result.data?.invalidEntity ?? null,
    invalidRelationEntities: result.data?.invalidRelationEntities ?? [],
  };
};
