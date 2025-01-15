import { Identity, store, useGraphFramework, useSelector } from '@graphprotocol/hypergraph';
import { Link, createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const spaces = useSelector(store, (state) => state.context.spaces);
  const { createSpace, listSpaces, listInvitations, invitations, acceptInvitation, isLoading } = useGraphFramework();
  const { authenticated } = Identity.useGraphLogin();

  useEffect(() => {
    if (authenticated && !isLoading) {
      listSpaces();
      listInvitations();
    }
  }, [authenticated, listSpaces, listInvitations, isLoading]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
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
      <h2 className="text-lg font-bold">Invitations</h2>
      {invitations.length === 0 && <div>No invitations</div>}
      <ul className="text-xs">
        {invitations.map((invitation) => {
          return (
            <li key={invitation.spaceId}>
              <Card>
                <CardHeader>
                  <CardTitle>Space: {invitation.spaceId}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={(event) => {
                      event.preventDefault();
                      acceptInvitation({
                        invitation,
                      });
                    }}
                  >
                    Accept
                  </Button>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-row gap-2 justify-between items-center">
        <h2 className="text-lg font-bold">Spaces</h2>
        <Button
          onClick={(event) => {
            event.preventDefault();
            createSpace();
          }}
        >
          Create space
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {spaces.length === 0 && <div>No spaces</div>}
        {spaces.map((space) => {
          return (
            <li key={space.id}>
              <Link to={`/space/${space.id}`}>
                <Card>
                  <CardHeader>
                    <CardTitle>{space.id}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
