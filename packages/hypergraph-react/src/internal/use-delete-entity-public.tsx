import { Graph, type GrcOp, Id } from '@graphprotocol/grc-20';
import type { Connect } from '@graphprotocol/hypergraph';
import { Config, Constants } from '@graphprotocol/hypergraph';
import { useQueryClient } from '@tanstack/react-query';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';
import request, { gql } from 'graphql-request';
import { publishOps } from '../publish-ops.js';

type DeleteEntityPublicParams = {
  space: string;
};

// Local implementation since unsetEntityValues is not exported from Graph namespace
// Note: The UNSET_ENTITY_VALUES op type exists in the v2 binary format but isn't
// included in the GrcOp type definition. Using type assertion as a workaround.
const unsetEntityValues = ({ id, properties }: { id: string; properties: string[] }) => {
  const op = {
    type: 'UNSET_ENTITY_VALUES',
    unsetEntityValues: {
      id: Id(id),
      properties: properties.map((propertyId) => Id(propertyId)),
    },
  } as unknown as GrcOp;
  return { id: Id(id), ops: [op] };
};

const deleteEntityQueryDocument = gql`
query entityToDelete($entityId: UUID!, $spaceId: UUID!) {
  entity(id: $entityId) {
    valuesList(filter: {spaceId: {is: $spaceId}}) {
      propertyId
    }
    relationsList(filter: {spaceId: {is: $spaceId}}) {
      id
    }
  }
}
`;

type EntityToDeleteQueryResult = {
  entity: {
    valuesList: {
      propertyId: string;
    }[];
    relationsList: {
      id: string;
    }[];
  };
} | null;

export const useDeleteEntityPublic = <S extends Schema.Schema.AnyNoContext>(
  type: S,
  { space }: DeleteEntityPublicParams,
) => {
  const queryClient = useQueryClient();

  return async ({ id, walletClient }: { id: string; walletClient: Connect.SmartSessionClient }) => {
    try {
      const result = await request<EntityToDeleteQueryResult>(
        `${Config.getApiOrigin()}/v2/graphql`,
        deleteEntityQueryDocument,
        {
          spaceId: space,
          entityId: id,
        },
      );
      if (!result) {
        return { success: false, error: 'Entity not found' };
      }
      const { valuesList, relationsList } = result.entity;
      const ops: GrcOp[] = [];
      const { ops: unsetEntityValuesOps } = unsetEntityValues({
        id,
        properties: valuesList.map(({ propertyId }) => propertyId),
      });
      ops.push(...unsetEntityValuesOps);
      for (const relation of relationsList) {
        const { ops: deleteRelationOps } = Graph.deleteRelation({ id: relation.id });
        ops.push(...deleteRelationOps);
      }

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
