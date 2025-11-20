import { Constants, Entity } from '@graphprotocol/hypergraph';
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { useHypergraphSpaceInternal } from './use-hypergraph-space-internal.js';

type UseEntityPublicParams<S extends Schema.Schema.AnyNoContext> = {
  id: string;
  enabled?: boolean;
  space?: string;
  // TODO: restrict multi-level nesting to the actual relation keys
  include?: Entity.EntityInclude<S> | undefined;
};

export const useEntityPublic = <S extends Schema.Schema.AnyNoContext>(type: S, params: UseEntityPublicParams<S>) => {
  const { id, enabled = true, space: spaceFromParams, include } = params;
  const { space: spaceFromContext } = useHypergraphSpaceInternal();
  const space = spaceFromParams ?? spaceFromContext;

  const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(type.ast as SchemaAST.TypeLiteral).pipe(
    Option.getOrElse(() => []),
  );

  const result = useQueryTanstack({
    queryKey: ['hypergraph-public-entity', id, typeIds, space, include],
    queryFn: async () => {
      return Entity.findOnePublic(type, {
        id,
        space,
        include,
      });
    },
    enabled: enabled && !!id && !!space,
  });

  return { ...result, data: result.data ?? null, invalidEntity: null };
};
