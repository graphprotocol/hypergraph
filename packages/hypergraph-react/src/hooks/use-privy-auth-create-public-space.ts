import { Graph } from '@geoprotocol/geo-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useHypergraphAuth } from '../HypergraphAppContext.js';

type CreatePublicSpaceParams = {
  name: string;
};

export const usePrivyAuthCreatePublicSpace = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { privyIdentity } = useHypergraphAuth();

  const createPublicSpace = async ({ name }: CreatePublicSpaceParams) => {
    const accountAddress = privyIdentity?.accountAddress;
    if (!accountAddress) {
      throw new Error('No account address found');
    }
    try {
      setIsLoading(true);
      const { id } = await Graph.createSpace({
        editorAddress: accountAddress,
        name,
        network: 'TESTNET',
      });
      queryClient.invalidateQueries({ queryKey: ['hypergraph-public-spaces'] });
      setIsLoading(false);
      return id;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };
  return { createPublicSpace, isLoading };
};
