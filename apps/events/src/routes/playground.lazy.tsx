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
    <HypergraphSpaceProvider space="a57cd482-6dd3-4ba3-ac44-e2e8ea7a2862">
      <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
        <h1 className="text-2xl font-bold">Playground</h1>
        <Playground />
        <CreatePropertiesAndTypesEvent space="a57cd482-6dd3-4ba3-ac44-e2e8ea7a2862" />
        <CreateEvents space="a57cd482-6dd3-4ba3-ac44-e2e8ea7a2862" />
      </div>
    </HypergraphSpaceProvider>
  );
}
