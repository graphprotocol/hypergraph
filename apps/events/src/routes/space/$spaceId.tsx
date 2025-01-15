import { Identity, Schema, store, useGraphFramework, useSelector } from '@graphprotocol/hypergraph';
import { Link, createFileRoute } from '@tanstack/react-router';

import { DevTool } from '@/components/dev-tool';
import { Todos } from '@/components/todos';
import { Button } from '@/components/ui/button';
import { availableAccounts } from '@/lib/availableAccounts';
import { useEffect } from 'react';

export const Route = createFileRoute('/space/$spaceId')({
  component: Space,
});

function Space() {
  const { spaceId } = Route.useParams();
  const spaces = useSelector(store, (state) => state.context.spaces);
  const { subscribeToSpace, inviteToSpace, isLoading } = useGraphFramework();
  const { authenticated } = Identity.useGraphLogin();
  useEffect(() => {
    if (!isLoading && authenticated) {
      subscribeToSpace({ spaceId });
    }
  }, [isLoading, subscribeToSpace, spaceId, authenticated]);

  const space = spaces.find((space) => space.id === spaceId);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  if (!space) {
    return <div className="flex justify-center items-center h-screen">Space not found</div>;
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">Not authenticated</h1>
        <Link to="/login" className="text-blue-500 hover:text-blue-600 underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-screen-sm mx-auto py-8">
      <Schema.SpacesProvider defaultSpace={space.id}>
        <Todos />
        <h3 className="text-xl font-bold">Invite people</h3>
        <div className="flex flex-row gap-2">
          {availableAccounts.map((invitee) => {
            return (
              <Button
                key={invitee.accountId}
                onClick={() => {
                  inviteToSpace({
                    space,
                    invitee,
                  });
                }}
              >
                Invite {invitee.accountId.substring(0, 6)}
              </Button>
            );
          })}
        </div>
        <div className="mt-12">
          <DevTool spaceId={spaceId} />
        </div>
      </Schema.SpacesProvider>
    </div>
  );
}
