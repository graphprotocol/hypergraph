import { ConvertTypesData } from '@/components/ConvertTypesData';
import { CreateEvents } from '@/components/create-events';
import { CreatePropertiesAndTypesEvent } from '@/components/create-properties-and-types-event';
import { Playground } from '@/components/playground';
import { HypergraphSpaceProvider } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = 'a393e509-ae56-4d99-987c-bed71d9db631';
  return (
    <HypergraphSpaceProvider space={space}>
      <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
        <h1 className="text-2xl font-bold">Playground</h1>
        <Playground />
        <CreatePropertiesAndTypesEvent space={space} />
        <CreateEvents space={space} />
        <ConvertTypesData />
      </div>
    </HypergraphSpaceProvider>
  );
}
