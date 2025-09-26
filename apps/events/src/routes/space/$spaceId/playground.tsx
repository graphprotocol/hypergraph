import { InviteToSpace } from '@/components/invite-to-space';
import { TodosPublic } from '@/components/todo/todos-public';
import { HypergraphSpaceProvider, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/space/$spaceId/playground')({
  component: PlaygroundRouteComponent,
});

function PlaygroundRouteComponent() {
  const { spaceId } = Route.useParams();
  const { isConnecting, isLoadingSpaces } = useHypergraphApp();

  if (isConnecting || isLoadingSpaces[spaceId]) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <HypergraphSpaceProvider space={spaceId}>
        <InviteToSpace />

        <TodosPublic />
      </HypergraphSpaceProvider>
    </div>
  );
}
