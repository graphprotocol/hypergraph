import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { store } from '@graphprotocol/hypergraph';
import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useSelector } from '@xstate/store/react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const spaces = useSelector(store, (state) => state.context.spaces);
  const [spaceName, setSpaceName] = useState('');

  const accountInboxes = useSelector(store, (state) => state.context.accountInboxes);
  const {
    createSpace,
    listSpaces,
    listInvitations,
    invitations,
    acceptInvitation,
    createAccountInbox,
    getOwnAccountInboxes,
    isConnecting,
  } = useHypergraphApp();

  useEffect(() => {
    if (!isConnecting) {
      listSpaces();
      listInvitations();
      getOwnAccountInboxes();
    }
  }, [isConnecting, listSpaces, listInvitations, getOwnAccountInboxes]);

  if (isConnecting) {
    return <div className="flex justify-center items-center h-screen">Loading …</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
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
      </div>
      <div className="flex flex-row gap-2 justify-between items-center">
        <Input value={spaceName} onChange={(e) => setSpaceName(e.target.value)} />
        <Button
          onClick={async (event) => {
            event.preventDefault();
            // const smartAccountWalletClient = await getSmartAccountWalletClient();
            // if (!smartAccountWalletClient) {
            //   throw new Error('Missing smartAccountWalletClient');
            // }
            createSpace({ name: spaceName });
            setSpaceName('');
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
              <Link to="/space/$spaceId" params={{ spaceId: space.id }}>
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

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Account Inboxes</h2>
        <Button
          onClick={(event) => {
            event.preventDefault();
            createAccountInbox({
              isPublic: true,
              authPolicy: 'optional_auth',
            });
          }}
        >
          Create account inbox
        </Button>
        <ul className="flex flex-col gap-2">
          {accountInboxes.length === 0 && <div>No account inboxes</div>}
          {accountInboxes.map((inbox) => {
            return (
              <li key={inbox.inboxId}>
                <Link to="/account-inbox/$inboxId" params={{ inboxId: inbox.inboxId }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{inbox.inboxId}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
