import { CreateEvents } from '@/components/create-events';
import { CreatePropertiesAndTypesEvent } from '@/components/create-properties-and-types-event';
import { Playground } from '@/components/playground';
import { Projects } from '@/components/projects';
import { HypergraphSpaceProvider } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = 'a393e509-ae56-4d99-987c-bed71d9db631';
  return (
    <>
      {/* <Event spaceId={space} entityId="cf7c620b-d724-498f-b134-8280dc8249ae" /> */}
      <Playground spaceId={space} />
      <Projects spaceId="3f32353d-3b27-4a13-b71a-746f06e1f7db" />
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
