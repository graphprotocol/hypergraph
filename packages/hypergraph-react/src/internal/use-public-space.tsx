import { Graph } from '@graphprotocol/grc-20';
import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';

const spaceQueryDocument = gql`
query Space($spaceId: UUID!) {
  space(id: $spaceId) {
    page {
      name
    }
  }
}
`;

type SpaceQueryResult = {
  space: {
    page: {
      name: string;
    };
  } | null;
};

export const usePublicSpace = ({ spaceId, enabled }: { spaceId: string; enabled: boolean }) => {
  const result = useQuery({
    queryKey: ['hypergraph-public-space', spaceId],
    queryFn: async () => {
      const result = await request<SpaceQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, spaceQueryDocument, {
        spaceId,
      });
      return result?.space?.page
        ? {
            name: result.space.page.name,
          }
        : null;
    },
    enabled,
  });

  return result.data;
};
