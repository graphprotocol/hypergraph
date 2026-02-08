import { useEntities } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Bounty } from '@/schema';

export const Route = createLazyFileRoute('/bounties')({
  component: RouteComponent,
});

const PERSON_ENTITY_ID = '7728d2458ae842d3a90a37e0bb8ee676';

function RouteComponent() {
  const { data: bounties, isLoading, isError } = useEntities(Bounty, {
    mode: 'public',
    spaces: 'all',
    filter: {
      interestedIn: { entityId: PERSON_ENTITY_ID },
    },
  });

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <h1 className="text-2xl font-bold">Bounties</h1>
      <p className="text-sm text-gray-500">
        Bounties where person {PERSON_ENTITY_ID} expressed interest
      </p>

      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading bounties</div>}

      {!isLoading && bounties.length === 0 && (
        <div className="text-gray-500">No bounties found</div>
      )}

      <ul className="flex flex-col gap-2">
        {bounties.map((bounty) => (
          <li key={bounty.id} className="border rounded p-4">
            <h2 className="font-semibold">{bounty.name}</h2>
            {bounty.description && (
              <p className="text-sm text-gray-600">{bounty.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{bounty.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
