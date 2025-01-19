import { store } from '@graphprotocol/hypergraph';
import { Hypergraph } from '@graphprotocol/hypergraph-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useSelector } from '@xstate/store/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type UnknownRoute = any;

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const spaces = useSelector(store, (state) => state.context.spaces);
  const { createSpace, listSpaces, listInvitations, invitations, acceptInvitation, loading } =
    Hypergraph.useHypergraphApp();

  console.log('Home page', { loading });

  useEffect(() => {
    if (!loading) {
      listSpaces();
      listInvitations();
    }
  }, [listSpaces, listInvitations, loading]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
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
              <Link to={`/space/${space.id}` as UnknownRoute}>
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
