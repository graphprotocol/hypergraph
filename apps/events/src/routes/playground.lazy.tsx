import { Playground } from '@/components/playground';
import { HypergraphSpaceProvider } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { mapping } from '../schema';

export const Route = createLazyFileRoute('/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <HypergraphSpaceProvider space="BDuZwkjCg3nPWMDshoYtpS" mapping={mapping}>
      <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
        <h1 className="text-2xl font-bold">Playground</h1>
        <Playground />
      </div>
    </HypergraphSpaceProvider>
  );
}
