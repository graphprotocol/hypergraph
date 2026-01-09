import { HypergraphSpaceProvider } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { CreateEvents } from '@/components/create-events';
import { CreatePropertiesAndTypesEvent } from '@/components/create-properties-and-types-event';
import { Event } from '@/components/event';
import { Playground } from '@/components/playground';

export const Route = createLazyFileRoute('/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = '282aee9648b04c6eb020736430a82a87';
  return (
    <>
      <Event spaceId={space} entityId="22aa038633654425a60eeaaec919c034" />
      <Playground spaceId={space} />
      {/* <Projects spaceId="3f32353d3b274a13b71a746f06e1f7db" /> */}
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
