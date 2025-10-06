import { CreateEvents } from '@/components/create-events';
import { CreatePropertiesAndTypesEvent } from '@/components/create-properties-and-types-event';
import { Event } from '@/components/event';
import { Playground } from '@/components/playground';
import { HypergraphSpaceProvider } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = '282aee96-48b0-4c6e-b020-736430a82a87';
  return (
    <>
      <Event spaceId={space} entityId="cf7c620b-d724-498f-b134-8280dc8249ae" />
      <Playground spaceId={space} />
      <HypergraphSpaceProvider space={space}>
        <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
          <h1 className="text-2xl font-bold">Playground</h1>
          <CreatePropertiesAndTypesEvent space={space} />
          <CreateEvents space={space} />
        </div>
      </HypergraphSpaceProvider>
    </>
  );
}
