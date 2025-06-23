import { type GeoSmartAccount, Graph, type Op } from '@graphprotocol/grc-20';
import type { Entity } from '@graphprotocol/hypergraph';
import { useQueryClient } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { publishOps } from '../publish-ops.js';
import { GEO_API_TESTNET_ENDPOINT } from './constants.js';

type DeleteEntityPublicParams = {
  space: string;
};

const deleteEntityQueryDocument = gql`
query entityToDelete($entityId: String!, $spaceId: String!) {
  entity(id: $entityId, spaceId: $spaceId) {
    values {
      propertyId
    }
    relations {
      id
    }
  }
}
`;

type EntityToDeleteQueryResult = {
  entity: {
    values: {
      propertyId: string;
    }[];
    relations: {
      id: string;
    }[];
  };
} | null;

export const useDeleteEntityPublic = <S extends Entity.AnyNoContext>(type: S, { space }: DeleteEntityPublicParams) => {
  const queryClient = useQueryClient();

  return async ({ id, walletClient }: { id: string; walletClient: GeoSmartAccount }) => {
    try {
      const result = await request<EntityToDeleteQueryResult>(GEO_API_TESTNET_ENDPOINT, deleteEntityQueryDocument, {
        spaceId: space,
        entityId: id,
      });
      if (!result) {
        return { success: false, error: 'Entity not found' };
      }
      const { values, relations } = result.entity;
      const ops: Op[] = [];
      const { ops: unsetEntityValuesOps } = Graph.unsetEntityValues({
        id,
        properties: values.map(({ propertyId }) => propertyId),
      });
      ops.push(...unsetEntityValuesOps);
      for (const relation of relations) {
        const { ops: deleteRelationOps } = Graph.deleteRelation({ id: relation.id });
        ops.push(...deleteRelationOps);
      }

      const { cid, txResult } = await publishOps({
        ops,
        space,
        name: `Delete entity ${id}`,
        walletClient,
        network: 'TESTNET',
      });
      // TODO: temporary fix until we get the information from the API when a transaction is confirmed
      await new Promise((resolve) => setTimeout(resolve, 2000));
      queryClient.invalidateQueries({
        queryKey: [
          'hypergraph-public-entities',
          // @ts-expect-error - TODO: find a better way to access the type.name
          type.name,
          space,
        ],
      });

      return { success: true, cid, txResult };
    } catch (error) {
      return { success: false, error: 'Failed to delete entity' };
    }
  };
};
