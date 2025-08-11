import { Dapp } from '@/schema';
import { useQuery } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore-public-knowledge/dapps')({
  component: Dapps,
});

function Dapps() {
  const { data: dapps, isPending } = useQuery(Dapp, {
    mode: 'public',
    space: 'b2565802-3118-47be-91f2-e59170735bac',
    first: 40,
  });

  console.log(dapps, isPending);

  return (
    <div className="container mx-auto px-0 py-0">
      <h1 className="text-3xl font-bold mb-2">dApps</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  );
}
