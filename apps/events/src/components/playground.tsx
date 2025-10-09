import { _useDeleteEntityPublic, useHypergraphApp, useQuery, useSpace } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Event } from '../schema';
import { Button } from './ui/button';

export const Playground = ({ spaceId }: { spaceId: string }) => {
  const { data, isLoading, isError, invalidEntities } = useQuery(Event, {
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
  const [isDeleting, setIsDeleting] = useState(false);
  const { getSmartSessionClient } = useHypergraphApp();

  const { name } = useSpace({ mode: 'public', space: spaceId });

  const deleteEntity = _useDeleteEntityPublic(Event, { space: spaceId });

  console.log({ isLoading, isError, data, invalidEntities });

  return (
    <div>
      <h2 className="text-lg font-bold">Space: {name}</h2>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data?.map((event) => (
        <div key={event.id}>
          <h2>{event.name}</h2>
          <Button
            onClick={async () => {
              setIsDeleting(true);
              const walletClient = await getSmartSessionClient();
              if (!walletClient) {
                alert('Wallet client not found');
                return;
              }
              await deleteEntity({
                id: event.id,
                walletClient,
              });
              setIsDeleting(false);
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <pre className="text-xs">{JSON.stringify(event, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};
