import { store } from '@graphprotocol/hypergraph/store';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from '@xstate/store/react';
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

export const useSpaces = (params: { mode: 'public' | 'private' }) => {
  const accountAddress = useSelector(store, (state) => state.context.identity?.accountAddress);
  const publicResult = useQuery({
    queryKey: ['hypergraph-spaces', params.mode],
    queryFn: async () => {
      const result = await request<PublicSpacesQueryResult>(GEO_API_TESTNET_ENDPOINT, publicSpacesQueryDocument, {
        accountAddress,
      });
      return result?.spaces
        ? result.spaces.map((space) => ({
            id: space.id,
            name: space.entity.name,
            spaceAddress: space.spaceAddress,
          }))
        : [];
    },
    enabled: params.mode === 'public' && !!accountAddress,
  });

  const spaces = useSelector(store, (state) => state.context.spaces);
  const spacesLoadingIsPending = useSelector(store, (state) => state.context.spacesLoadingIsPending);

  if (params.mode === 'private') {
    return {
      data: spaces,
      isPending: spacesLoadingIsPending,
    };
  }

  return publicResult;
};
