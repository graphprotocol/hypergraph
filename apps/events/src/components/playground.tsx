import { getSmartAccountWalletClient } from '@/lib/smart-account';
import { _useDeleteEntityPublic, useQuery } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Event } from '../schema';
import { Button } from './ui/button';

export const Playground = () => {
  const { data, isLoading, isError } = useQuery(Event, {
    mode: 'public',
    include: {
      sponsors: {
        jobOffers: {},
      },
    },
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteEntity = _useDeleteEntityPublic(Event, {
    space: '1c954768-7e14-4f0f-9396-0fe9dcd55fe8',
  });

  console.log({ isLoading, isError, data });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data?.map((event) => (
        <div key={event.id}>
          <h2>{event.name}</h2>
          <Button
            onClick={async () => {
              setIsDeleting(true);
              const walletClient = await getSmartAccountWalletClient();
              if (!walletClient) {
                alert('Wallet client not found');
                return;
              }
              await deleteEntity({
                id: event.id,
                // @ts-expect-error - TODO: fix the types error
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
