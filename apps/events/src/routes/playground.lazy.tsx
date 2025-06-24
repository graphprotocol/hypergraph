import { CreateEvents } from '@/components/create-events';
import { CreatePropertiesAndTypesEvent } from '@/components/create-properties-and-types-event';
import { Playground } from '@/components/playground';
import { HypergraphSpaceProvider } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <HypergraphSpaceProvider space="1c954768-7e14-4f0f-9396-0fe9dcd55fe8">
      <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
        <h1 className="text-2xl font-bold">Playground</h1>
        <Playground />
        <CreatePropertiesAndTypesEvent space="1c954768-7e14-4f0f-9396-0fe9dcd55fe8" />
        <CreateEvents space="1c954768-7e14-4f0f-9396-0fe9dcd55fe8" />
      </div>
    </HypergraphSpaceProvider>
  );
}
