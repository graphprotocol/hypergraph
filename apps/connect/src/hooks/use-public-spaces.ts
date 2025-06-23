import { Connect } from '@graphprotocol/hypergraph';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';

const publicSpacesQueryDocument = gql`
query Spaces($accountAddress: String!) {
  spaces(filter: {
      member: { is: $accountAddress }
  }) {
    id
    type
    mainVotingAddress
    personalAddress
    entity {
      name
    }
  }
}
`;

type SpaceQueryResult = {
  id: string;
  type: string;
  mainVotingAddress: string;
  personalAddress: string;
  entity: {
    name: string;
  };
};

type PublicSpacesQueryResult = {
  spaces: SpaceQueryResult[];
};

export type PublicSpaceData = {
  id: string;
  type: string;
  mainVotingAddress: string;
  personalAddress: string;
  name: string;
};

export const usePublicSpaces = (url: string): UseQueryResult<PublicSpaceData[], Error> => {
  return useQuery<PublicSpaceData[]>({
    queryKey: ['public-spaces'],
    queryFn: async () => {
      const accountAddress = Connect.loadAccountAddress(localStorage);
      if (!accountAddress) return [];
      const result = await request<PublicSpacesQueryResult>(url, publicSpacesQueryDocument, {
        accountAddress,
      });
      return result?.spaces
        ? result.spaces.map((space: SpaceQueryResult) => ({
            id: space.id,
            name: space.entity.name,
            type: space.type,
            mainVotingAddress: space.mainVotingAddress,
            personalAddress: space.personalAddress,
          }))
        : [];
    },
  });
};
