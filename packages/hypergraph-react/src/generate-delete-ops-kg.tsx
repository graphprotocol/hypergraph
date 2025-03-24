import { type Op, Relation, Triple } from '@graphprotocol/grc-20';
import { gql, request } from 'graphql-request';
import { KG_ENDPOINT } from './internal/constants.js';

const deleteEntityQueryDocument = gql`
query deleteEntity($spaceId: String!, $id: String!) {
  entity(spaceId: $spaceId, id: $id) {
    attributes {
      attribute
    }
    relations {
      id
    }
  }
}
`;

type DeleteEntityResult = {
  entity: {
    attributes: {
      attribute: string;
    }[];
    relations: {
      id: string;
    }[];
  } | null;
};

export const generateDeleteOps = async ({ id, space }: { id: string; space: string }) => {
  const result = await request<DeleteEntityResult>(KG_ENDPOINT, deleteEntityQueryDocument, {
    id,
    spaceId: space,
  });
  if (result.entity === null) {
    throw new Error('Entity not found');
  }
  const ops: Op[] = [];
  for (const attribute of result.entity.attributes) {
    ops.push(Triple.remove({ attributeId: attribute.attribute, entityId: id }));
  }
  for (const relation of result.entity.relations) {
    ops.push(Relation.remove(relation.id));
  }
  return ops;
};
