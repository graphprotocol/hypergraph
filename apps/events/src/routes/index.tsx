import { store } from '@graphprotocol/hypergraph';
import { useHypergraphApp, usePublicSpaces, useSpaces } from '@graphprotocol/hypergraph-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSelector } from '@xstate/store/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/')({
  component: Index,
});

// @ts-expect-error
window.HYPERGRAPH_STORE = store;

function Index() {
  const { data: publicSpaces } = useSpaces({ mode: 'public' });
  const { data: privateSpaces } = useSpaces({ mode: 'private' });

  const { data: publicSpaces2, invalidSpaces } = usePublicSpaces({
    filter: { editorId: 'b0043a26-cb81-379c-1217-dfd2283b67b8' },
  });

  console.log({ invalidSpaces });

  const [spaceName, setSpaceName] = useState('');

  const accountInboxes = useSelector(store, (state) => state.context.accountInboxes);
  const {
    createSpace,
    listInvitations,
    invitations,
    acceptInvitation,
    createAccountInbox,
    getOwnAccountInboxes,
    isConnecting,
  } = useHypergraphApp();

  useEffect(() => {
    if (!isConnecting) {
      listInvitations();
      getOwnAccountInboxes();
    }
  }, [isConnecting, listInvitations, getOwnAccountInboxes]);

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
          disabled={true} // disabled until we have delegation for creating a space
          onClick={async (event) => {
            event.preventDefault();
            // const smartSessionClient = await getSmartSessionClient();
            // if (!smartSessionClient) {
            //   throw new Error('Missing smartSessionClient');
            // }
            createSpace({ name: spaceName });
            setSpaceName('');
          }}
        >
          Create space
        </Button>
      </div>

      <h2 className="text-lg font-bold">Private Spaces</h2>
      <ul className="flex flex-col gap-2">
        {privateSpaces && privateSpaces.length === 0 && <div>No spaces</div>}
        {privateSpaces?.map((space) => {
          return (
            <li key={space.id}>
              <Link to="/space/$spaceId" params={{ spaceId: space.id }}>
                <Card>
                  <CardHeader>
                    <CardTitle>{space.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="text-lg font-bold">Public Spaces</h2>
      <ul className="flex flex-col gap-2">
        {publicSpaces?.map((space) => {
          return (
            <li key={space.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{space.name}</CardTitle>
                  <CardDescription className="text-xs">{space.id}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          );
        })}
        v2
        {publicSpaces2?.map((space) => {
          return (
            <li key={space.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{space.name}</CardTitle>
                </CardHeader>
              </Card>
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
