import { Space } from '@graphprotocol/hypergraph';
import { useQuery } from '@tanstack/react-query';

export const usePublicSpaces = () => {
  const result = useQuery({
    queryKey: ['hypergraph-public-spaces'],
    queryFn: Space.findManyPublic,
  });

  return {
    ...result,
    data: result.data?.data ?? [],
    invalidSpaces: result.data?.invalidSpaces ?? [],
  };
};
