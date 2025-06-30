import { Events } from '@/components/events/events';
import { HypergraphSpaceProvider, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/space/$spaceId/events')({
  component: RouteComponent,
});

function RouteComponent() {
  const { spaceId } = Route.useParams();
  const { isConnecting, isLoadingSpaces } = useHypergraphApp();

  if (isConnecting || isLoadingSpaces[spaceId]) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <HypergraphSpaceProvider space={spaceId}>
        <Events />
      </HypergraphSpaceProvider>
    </div>
  );
}
