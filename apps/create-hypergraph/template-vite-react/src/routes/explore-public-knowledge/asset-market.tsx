import { Asset } from '@/schema';
import { useQuery } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore-public-knowledge/asset-market')({
  component: AssetMarket,
});

function AssetMarket() {
  const { data: assets, isPending } = useQuery(Asset, {
    mode: 'public',
    space: 'b2565802-3118-47be-91f2-e59170735bac',
    first: 40,
  });

  console.log(assets, isPending);
  return (
    <div className="container mx-auto px-0 py-0">
      <h1 className="text-3xl font-bold mb-2">Asset Market</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  );
}
