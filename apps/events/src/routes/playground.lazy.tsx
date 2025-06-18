import { Playground } from '@/components/playground';
import { mapping } from '@/mapping.js';
import { HypergraphSpaceProvider } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <HypergraphSpaceProvider space="aa84b08d-779a-495c-93f1-44e667baf6d7" mapping={mapping}>
      <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
        <h1 className="text-2xl font-bold">Playground</h1>
        <Playground />
      </div>
    </HypergraphSpaceProvider>
  );
}
