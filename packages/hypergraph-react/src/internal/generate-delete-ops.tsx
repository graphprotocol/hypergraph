import { Graph, type Op } from '@graphprotocol/grc-20';
import { gql, request } from 'graphql-request';

const deleteEntityQueryDocument = gql`
query entity($entityId: String!) {
  entity(id: $entityId) {
    id
    currentVersion {
      version {
        triples {
          nodes {
            attributeId
          }
        }
        relationsByFromVersionId {
          nodes {
            id
          }
        }
      }
    }
  }
}

`;

type DeleteEntityResult = {
  entity: {
    currentVersion: {
      version: {
        triples: {
          nodes: {
            attributeId: string;
          }[];
        };
        relationsByFromVersionId: {
          nodes: {
            id: string;
          }[];
        };
      };
    };
  } | null;
};

export const generateDeleteOps = async ({ id }: { id: string; space: string }) => {
  const result = await request<DeleteEntityResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, deleteEntityQueryDocument, {
    entityId: id,
  });
  if (result.entity === null) {
    throw new Error('Entity not found');
  }
  const ops: Op[] = [];
  // for (const attribute of result.entity.currentVersion.version.triples.nodes) {
  //   ops.push(Triple.remove({ attributeId: attribute.attributeId, entityId: id }));
  // }
  // for (const relation of result.entity.currentVersion.version.relationsByFromVersionId.nodes) {
  //   ops.push(Relation.remove(relation.id));
  // }
  return ops;
};
