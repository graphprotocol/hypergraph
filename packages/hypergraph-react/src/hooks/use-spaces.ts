import { Graph } from '@graphprotocol/grc-20';
import { store } from '@graphprotocol/hypergraph';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from '@xstate/store/react';
import { gql, request } from 'graphql-request';
import { useEffect } from 'react';
import { useHypergraphApp } from '../HypergraphAppContext.js';

const publicSpacesQueryDocument = gql`
query Spaces($accountAddress: String!) {
  spaces(filter: {members: {some: {address: {is: $accountAddress}}}}) {
    id
    spaceAddress
    page {
      name
    }
  }
}
`;

type PublicSpacesQueryResult = {
  spaces: {
    id: string;
    spaceAddress: string;
    page: {
      name: string;
    } | null;
  }[];
};

export const useSpaces = (params: { mode: 'public' | 'private' }) => {
  const accountAddress = useSelector(store, (state) => state.context.identity?.accountAddress);
  const publicResult = useQuery({
    queryKey: ['hypergraph-spaces', params.mode],
    queryFn: async () => {
      const result = await request<PublicSpacesQueryResult>(
        `${Graph.TESTNET_API_ORIGIN}/graphql`,
        publicSpacesQueryDocument,
        {
          accountAddress,
        },
      );
      return result?.spaces
        ? result.spaces.map((space) => ({
            id: space.id,
            name: space.page?.name,
            spaceAddress: space.spaceAddress,
          }))
        : [];
    },
    enabled: params.mode === 'public' && !!accountAddress,
  });

  const { isConnecting, listSpaces } = useHypergraphApp();

  useEffect(() => {
    if (params.mode === 'private' && !isConnecting) {
      listSpaces();
    }
  }, [params.mode, listSpaces, isConnecting]);

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
