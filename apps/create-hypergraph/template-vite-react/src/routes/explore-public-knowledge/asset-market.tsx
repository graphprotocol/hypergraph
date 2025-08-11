import { createFileRoute } from '@tanstack/react-router';

function AssetMarket() {
  return (
    <div className="container mx-auto px-0 py-0">
      <h1 className="text-3xl font-bold mb-2">Asset Market</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  );
}

export const Route = createFileRoute('/explore-public-knowledge/asset-market')({
  component: AssetMarket,
});
