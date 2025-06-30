import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import { GEO_API_TESTNET_ENDPOINT } from '../internal/constants.js';

const spaceQueryDocument = gql`
query Space($spaceId: String!) {
  space(id: $spaceId) {
    entity {
      name
    }
  }
}
`;

type SpaceQueryResult = {
  space: {
    entity: {
      name: string;
    };
  } | null;
};

export const usePublicSpace = ({ spaceId, enabled }: { spaceId: string; enabled: boolean }) => {
  const result = useQuery({
    queryKey: ['hypergraph-public-space', spaceId],
    queryFn: async () => {
      const result = await request<SpaceQueryResult>(GEO_API_TESTNET_ENDPOINT, spaceQueryDocument, {
        spaceId,
      });
      return result?.space?.entity
        ? {
            name: result.space.entity.name,
          }
        : null;
    },
    enabled,
  });

  return result.data;
};
