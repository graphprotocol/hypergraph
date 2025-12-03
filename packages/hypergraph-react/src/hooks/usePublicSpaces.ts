import { Space } from '@graphprotocol/hypergraph';
import { useQuery } from '@tanstack/react-query';

type UsePublicSpacesParams = Readonly<{
  filter?: Space.FindManyPublicParams['filter'];
  enabled?: boolean;
}>;

export const usePublicSpaces = (params?: UsePublicSpacesParams) => {
  const { filter, enabled = true } = params ?? {};

  const result = useQuery({
    queryKey: ['hypergraph-public-spaces', filter],
    queryFn: () => (filter ? Space.findManyPublic({ filter }) : Space.findManyPublic()),
    enabled,
  });

  return {
    ...result,
    data: result.data?.data ?? [],
    invalidSpaces: result.data?.invalidSpaces ?? [],
  };
};
