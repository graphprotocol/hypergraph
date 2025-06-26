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
    <HypergraphSpaceProvider space="d9814a82-8dab-4d02-86d2-9d413f7dc336">
      <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
        <h1 className="text-2xl font-bold">Playground</h1>
        <Playground />
        <CreatePropertiesAndTypesEvent space="d9814a82-8dab-4d02-86d2-9d413f7dc336" />
        <CreateEvents space="d9814a82-8dab-4d02-86d2-9d413f7dc336" />
      </div>
    </HypergraphSpaceProvider>
  );
}
