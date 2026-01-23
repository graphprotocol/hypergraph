import { Graph } from '@geoprotocol/geo-sdk';
import type { Connect } from '@graphprotocol/hypergraph';
import { Constants } from '@graphprotocol/hypergraph';
import { useQueryClient } from '@tanstack/react-query';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import { publishOps } from '../publish-ops.js';

type DeleteEntityPublicParams = {
  space: string;
};

export const useDeleteEntityPublic = <S extends Schema.Schema.AnyNoContext>(
  type: S,
  { space }: DeleteEntityPublicParams,
) => {
  const queryClient = useQueryClient();

  return async ({ id, walletClient }: { id: string; walletClient: Connect.SmartSessionClient }) => {
    try {
      const { ops } = Graph.deleteEntity({ id });

      const { cid, txResult } = await publishOps({
        ops,
        space,
        name: `Delete entity ${id}`,
        walletClient,
      });

      const typeIds = SchemaAST.getAnnotation<string[]>(Constants.TypeIdsSymbol)(
        type.ast as SchemaAST.TypeLiteral,
      ).pipe(Option.getOrElse(() => []));

      // TODO: temporary fix until we get the information from the API when a transaction is confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (typeIds.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ['hypergraph-public-entities', space, typeIds],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ['hypergraph-public-entities', space],
        });
      }

      return { success: true, cid, txResult };
    } catch (_error) {
      return { success: false, error: 'Failed to delete entity' };
    }
  };
};
