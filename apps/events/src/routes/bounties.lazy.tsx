import { Bounty } from '@/schema';
import { useEntities } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createLazyFileRoute('/bounties')({
  component: RouteComponent,
});

type AllocationFilter = 'all' | 'allocated' | 'unallocated';

function RouteComponent() {
  const [allocationFilter, setAllocationFilter] = useState<AllocationFilter>('all');
  const filter = allocationFilter === 'all' ? undefined : { allocated: { exists: allocationFilter === 'allocated' } };

  const {
    data: bounties,
    isLoading,
    isError,
  } = useEntities(Bounty, {
    mode: 'public',
    spaces: 'all',
    filter,
    include: {
      allocated: {},
    },
  });

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <h1 className="text-2xl font-bold">Bounties</h1>
      <p className="text-sm text-gray-500">Filter bounties by allocation status</p>
      <label className="text-sm text-gray-700 flex flex-col gap-1">
        Allocation status
        <select
          className="border rounded px-2 py-1 bg-white"
          value={allocationFilter}
          onChange={(event) => setAllocationFilter(event.target.value as AllocationFilter)}
        >
          <option value="all">All</option>
          <option value="allocated">Allocated (at least one person)</option>
          <option value="unallocated">Unallocated (no one)</option>
        </select>
      </label>

      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading bounties</div>}

      {!isLoading && bounties.length === 0 && <div className="text-gray-500">No bounties found</div>}

      <ul className="flex flex-col gap-2">
        {bounties.map((bounty) => (
          <li key={bounty.id} className="border rounded p-4">
            <h2 className="font-semibold">{bounty.name}</h2>
            {bounty.description && <p className="text-sm text-gray-600">{bounty.description.substring(0, 100)}...</p>}
            <p className="text-xs text-gray-400 mt-1">{bounty.id}</p>
            <p className="text-xs text-gray-400 mt-1">
              Allocated to: {bounty.allocated.map((allocated) => allocated.name).join(', ')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
