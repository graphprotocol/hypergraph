import { createFileRoute } from '@tanstack/react-router';

function Dapps() {
  return (
    <div className="container mx-auto px-0 py-0">
      <h1 className="text-3xl font-bold mb-2">dApps</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </div>
  );
}

export const Route = createFileRoute('/explore-public-knowledge/dapps')({
  component: Dapps,
});
