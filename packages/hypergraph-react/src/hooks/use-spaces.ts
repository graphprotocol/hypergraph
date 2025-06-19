import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import { GEO_API_TESTNET_ENDPOINT } from '../internal/constants.js';

const publicSpacesQueryDocument = gql`
query Spaces($accountAddress: String!) {
  spaces(filter: {
      member: { is: $accountAddress }
  }) {
    id
    spaceAddress
    entity {
      name
    }
  }
}
`;

type PublicSpacesQueryResult = {
  spaces: {
    id: string;
    spaceAddress: string;
    entity: {
      name: string;
    };
  }[];
};

export const useSpaces = (params: { mode: 'public' }) => {
  return useQuery({
    queryKey: ['hypergraph-spaces', params.mode],
    queryFn: async () => {
      const result = await request<PublicSpacesQueryResult>(GEO_API_TESTNET_ENDPOINT, publicSpacesQueryDocument, {
        accountAddress: '0xBE0298aF8D440bEFA78E7e8A538D8ecBFF06bfC7',
      });
      return result?.spaces
        ? result.spaces.map((space) => ({
            id: space.id,
            name: space.entity.name,
            spaceAddress: space.spaceAddress,
          }))
        : [];
    },
  });
};
