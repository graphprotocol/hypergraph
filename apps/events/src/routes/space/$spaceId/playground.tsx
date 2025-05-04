import { TodosPublicGeo } from '@/components/todo/todos-public-geo';
import { mapping } from '@/schema';
import { store } from '@graphprotocol/hypergraph';
import { HypergraphSpaceProvider, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
import { useSelector } from '@xstate/store/react';
import { useEffect } from 'react';

export const Route = createFileRoute('/space/$spaceId/playground')({
  component: PlaygroundRouteComponent,
});

function PlaygroundRouteComponent() {
  const { spaceId } = Route.useParams();
  const spaces = useSelector(store, (state) => state.context.spaces);
  const { subscribeToSpace, isConnecting, isLoadingSpaces } = useHypergraphApp();
  useEffect(() => {
    if (!isConnecting) {
      subscribeToSpace({ spaceId });
    }
  }, [isConnecting, subscribeToSpace, spaceId]);

  const space = spaces.find((space) => space.id === spaceId);

  if (isConnecting || isLoadingSpaces[spaceId]) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  if (!space) {
    return <div className="flex justify-center items-center h-screen">Space not found</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-screen-sm mx-auto py-8">
      <HypergraphSpaceProvider space={spaceId} mapping={mapping}>
        <TodosPublicGeo />
      </HypergraphSpaceProvider>
    </div>
  );
}
