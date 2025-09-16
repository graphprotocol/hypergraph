import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
import { SpaceChat } from '@/components/SpaceChat';

export const Route = createFileRoute('/space/$spaceId/chat')({
  component: RouteComponent,
});

function RouteComponent() {
  const { spaceId } = Route.useParams();
  const { isConnecting } = useHypergraphApp();

  if (isConnecting) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <SpaceChat spaceId={spaceId} />
    </div>
  );
}
