import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { GraphFramework, SpacesProvider, store, useGraphFramework, useSelector } from '@graphprotocol/graph-framework';

import { DebugInvitations } from '@/components/debug-invitations';
import { DebugSpaceEvents } from '@/components/debug-space-events';
import { DebugSpaceState } from '@/components/debug-space-state';
import { TodosApp } from '@/components/todos-app';
import { Button } from '@/components/ui/button';

const availableAccounts = [
  {
    accountId: '0262701b2eb1b6b37ad03e24445dfcad1b91309199e43017b657ce2604417c12f5',
    signaturePrivateKey: '88bb6f20de8dc1787c722dc847f4cf3d00285b8955445f23c483d1237fe85366',
    encryptionPrivateKey: 'bbf164a93b0f78a85346017fa2673cf367c64d81b1c3d6af7ad45e308107a812',
    encryptionPublicKey: '595e1a6b0bb346d83bc382998943d2e6d9210fd341bc8b9f41a7229eede27240',
  },
  {
    accountId: '03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
    signaturePrivateKey: '1eee32d3bc202dcb5d17c3b1454fb541d2290cb941860735408f1bfe39e7bc15',
    encryptionPrivateKey: 'b32478dc6f40482127a09d0f1cabbf45dc83ebce638d6246f5552191009fda2c',
    encryptionPublicKey: '0f4e22dc85167597af85cba85988770cd77c25d317f2b14a1f49a54efcbfae3f',
  },
  {
    accountId: '0351460706cf386282d9b6ebee2ccdcb9ba61194fd024345e53037f3036242e6a2',
    signaturePrivateKey: '434518a2c9a665a7c20da086232c818b6c1592e2edfeecab29a40cf5925ca8fe',
    encryptionPrivateKey: 'aaf71397e44fc57b42eaad5b0869d1e0247b4a7f2fe9ec5cc00dec3815849e7a',
    encryptionPublicKey: 'd494144358a610604c4ab453b442d014f2843772eed19be155dd9fc55fe8a332',
  },
];

export const Route = createFileRoute('/playground')({
  component: () => <ChooseAccount />,
});

const App = ({
  signaturePrivateKey,
  encryptionPublicKey,
  encryptionPrivateKey,
}: {
  accountId: string;
  signaturePrivateKey: string;
  encryptionPrivateKey: string;
  encryptionPublicKey: string;
}) => {
  const spaces = useSelector(store, (state) => state.context.spaces);
  const updatesInFlight = useSelector(store, (state) => state.context.updatesInFlight);
  const { createSpace, listSpaces, listInvitations, invitations, acceptInvitation, subscribeToSpace, inviteToSpace } =
    useGraphFramework();

  return (
    <>
      <div>
        <Button
          onClick={() => {
            createSpace({ encryptionPublicKey, encryptionPrivateKey, signaturePrivateKey });
          }}
        >
          Create space
        </Button>

        <Button
          onClick={() => {
            listSpaces();
          }}
        >
          List Spaces
        </Button>

        <Button
          onClick={() => {
            listInvitations();
          }}
        >
          List Invitations
        </Button>
      </div>
      <h2 className="text-lg">Invitations</h2>
      <DebugInvitations
        invitations={invitations}
        accept={acceptInvitation}
        encryptionPublicKey={encryptionPublicKey}
        encryptionPrivateKey={encryptionPrivateKey}
        signaturePrivateKey={signaturePrivateKey}
      />
      <h2 className="text-lg">Spaces</h2>
      <ul>
        {spaces.map((space) => {
          return (
            <li key={space.id}>
              <SpacesProvider defaultSpace={space.id}>
                <h3>Space id: {space.id}</h3>
                <p>Keys:</p>
                <pre className="text-xs">{JSON.stringify(space.keys)}</pre>
                <Button
                  onClick={() => {
                    subscribeToSpace({ spaceId: space.id });
                  }}
                >
                  Get data and subscribe to Space
                </Button>
                <br />
                {availableAccounts.map((invitee) => {
                  return (
                    <Button
                      key={invitee.accountId}
                      onClick={() => {
                        inviteToSpace({
                          encryptionPublicKey,
                          encryptionPrivateKey,
                          signaturePrivateKey,
                          space,
                          invitee,
                        });
                      }}
                    >
                      Invite {invitee.accountId.substring(0, 4)}
                    </Button>
                  );
                })}
                <h3>Updates</h3>

                <TodosApp />
                <h3>Last update clock: {space.lastUpdateClock}</h3>
                <h3>Updates in flight</h3>
                <ul className="text-xs">
                  {updatesInFlight.map((updateInFlight) => {
                    return (
                      <li key={updateInFlight} className="border border-gray-300">
                        {updateInFlight}
                      </li>
                    );
                  })}
                </ul>
                <hr />
                <h3>State</h3>
                <DebugSpaceState state={space.state} />
                <hr />
                <h3>Events</h3>
                <DebugSpaceEvents events={space.events} />
                <hr />
              </SpacesProvider>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export const ChooseAccount = () => {
  const [account, setAccount] = useState<{
    accountId: string;
    signaturePrivateKey: string;
    encryptionPrivateKey: string;
    encryptionPublicKey: string;
  } | null>();

  return (
    <div>
      <h1>Choose account</h1>
      <Button
        onClick={() => {
          store.send({ type: 'reset' });
          store.send({
            type: 'setEncryptionPrivateKey',
            encryptionPrivateKey: availableAccounts[0].encryptionPrivateKey,
          });
          setAccount(availableAccounts[0]);
        }}
      >
        {availableAccounts[0].accountId.substring(0, 4)}
      </Button>
      <Button
        onClick={() => {
          store.send({ type: 'reset' });
          store.send({
            type: 'setEncryptionPrivateKey',
            encryptionPrivateKey: availableAccounts[1].encryptionPrivateKey,
          });
          setAccount(availableAccounts[1]);
        }}
      >
        {availableAccounts[1].accountId.substring(0, 4)}
      </Button>
      <Button
        onClick={() => {
          store.send({ type: 'reset' });
          store.send({
            type: 'setEncryptionPrivateKey',
            encryptionPrivateKey: availableAccounts[2].encryptionPrivateKey,
          });
          setAccount(availableAccounts[2]);
        }}
      >
        {availableAccounts[2].accountId.substring(0, 4)}
      </Button>
      Account: {account?.accountId ? account.accountId : 'none'}
      <hr />
      {account && (
        <GraphFramework accountId={account.accountId}>
          <App
            // forcing a remount of the App component when the accountId changes
            key={account.accountId}
            accountId={account.accountId}
            signaturePrivateKey={account.signaturePrivateKey}
            encryptionPrivateKey={account.encryptionPrivateKey}
            encryptionPublicKey={account.encryptionPublicKey}
          />
        </GraphFramework>
      )}
    </div>
  );
};
