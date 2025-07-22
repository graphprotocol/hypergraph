import { HypergraphSpaceProvider, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
import { CreatePropertiesAndTypesTodos } from '@/components/create-properties-and-types-todos';
import { Todos2 } from '@/components/todos2';

export const Route = createFileRoute('/space/$spaceId/public-integration')({
  component: PublicIntegration,
});

function PublicIntegration() {
  const { spaceId } = Route.useParams();
  const { isConnecting, isLoadingSpaces } = useHypergraphApp();

  if (isConnecting || isLoadingSpaces[spaceId]) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <HypergraphSpaceProvider space={spaceId}>
        <CreatePropertiesAndTypesTodos space={spaceId} />
        <Todos2 />
      </HypergraphSpaceProvider>
    </div>
  );
}
