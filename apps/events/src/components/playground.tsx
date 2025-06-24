import {
  _useCreateEntityPublic,
  _useDeleteEntityPublic,
  useHypergraphApp,
  useQuery,
} from '@graphprotocol/hypergraph-react';
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
  const [isCreating, setIsCreating] = useState(false);
  const { getSmartSessionClient } = useHypergraphApp();

  const deleteEntity = _useDeleteEntityPublic(Event, {
    space: '1c954768-7e14-4f0f-9396-0fe9dcd55fe8',
  });

  const createEntity = _useCreateEntityPublic(Event, {
    space: '1c954768-7e14-4f0f-9396-0fe9dcd55fe8',
  });

  console.log({ isLoading, isError, data });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      <Button
        disabled={isCreating}
        onClick={async () => {
          setIsCreating(true);
          const walletClient = await getSmartSessionClient();
          if (!walletClient) {
            alert('Wallet client not found');
            setIsCreating(false);
            return;
          }
          const { success, cid, txResult } = await createEntity(
            {
              name: 'Test Event 42 by Nik',
              sponsors: ['347676a1-7cef-47dc-b6a7-c94fc6237dcd'],
            },
            // @ts-expect-error - TODO: fix the types error
            { walletClient },
          );
          console.log('created', { success, cid, txResult });
          setIsCreating(false);
        }}
      >
        Create
      </Button>
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
