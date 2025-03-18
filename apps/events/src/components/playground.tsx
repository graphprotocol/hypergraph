import { useQuery } from '@graphprotocol/hypergraph-react';
import { NewsStory } from '../schema';

export const Playground = () => {
  const { data: entityData, isLoading, isError } = useQuery(NewsStory, { mode: 'public' });

  console.log({ isLoading, isError, entityData });

  return <pre className="text-xs">{JSON.stringify(entityData, null, 2)}</pre>;
};
