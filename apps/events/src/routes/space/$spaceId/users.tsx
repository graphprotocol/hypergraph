import { UsersMerged } from '@/components/users/users-merged';
import { UsersPublic } from '@/components/users/users-public';
import { HypergraphSpaceProvider, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
import { UsersLocal } from '../../../components/users/users-local';
export const Route = createFileRoute('/space/$spaceId/users')({
  component: UsersRouteComponent,
});

function UsersRouteComponent() {
  const { spaceId } = Route.useParams();
  const { isConnecting, isLoadingSpaces } = useHypergraphApp();

  if (isConnecting || isLoadingSpaces[spaceId]) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <HypergraphSpaceProvider space={spaceId}>
        <UsersMerged />
        <UsersLocal />
        <UsersPublic />
      </HypergraphSpaceProvider>
    </div>
  );
}
