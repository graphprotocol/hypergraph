import { useEntity } from '@graphprotocol/hypergraph-react';
import { Event as EventType } from '../schema';

export const Event = ({ spaceId, entityId }: { spaceId: string; entityId: string }) => {
  const { data, isPending, isError } = useEntity(EventType, {
    mode: 'public',
    include: {
      sponsors: {
        jobOffers: {},
      },
    },
    id: entityId,
    space: spaceId,
  });

  console.log({ component: 'Event', isPending, isError, data });

  return (
    <div>
      {isPending && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data && (
        <div>
          <h2>Event Details</h2>
          <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
