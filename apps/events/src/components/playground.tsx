import { useEntities, useSpace } from '@graphprotocol/hypergraph-react';
import { Event } from '../schema';

export const Playground = ({ spaceId }: { spaceId: string }) => {
  const { data, isLoading, isError, invalidEntities } = useEntities(Event, {
    mode: 'public',
    include: {
      sponsors: {
        jobOffers: {},
      },
    },
    filter: {
      or: [{ name: { startsWith: 'My' } }, { name: { startsWith: 'ETH' } }],
    },
    // filter: { name: { startsWith: 'My Test Event' } },
    first: 100,
    space: spaceId,
  });

  const { name } = useSpace({ mode: 'public', space: spaceId });

  console.log({ isLoading, isError, data, invalidEntities });

  return (
    <div>
      <h2 className="text-lg font-bold">Space: {name}</h2>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data?.map((event) => (
        <div key={event.id}>
          <h2>{event.name}</h2>
          <pre className="text-xs">{JSON.stringify(event, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};
