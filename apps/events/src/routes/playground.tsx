import { DebugInvitations } from '@/components/debug-invitations';
import { DebugSpaceEvents } from '@/components/debug-space-events';
import { DebugSpaceState } from '@/components/debug-space-state';
import { Button } from '@/components/ui/button';
import { assertExhaustive } from '@/lib/assertExhaustive';
import { createFileRoute } from '@tanstack/react-router';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import type {
  EventMessage,
  Invitation,
  RequestListInvitations,
  RequestListSpaces,
  RequestSubscribeToSpace,
  SpaceEvent,
  SpaceState,
} from 'graph-framework';
import { ResponseMessage, applyEvent, createInvitation, createSpace } from 'graph-framework';
import { useEffect, useState } from 'react';

const availableAccounts = [
  {
    accountId: '0262701b2eb1b6b37ad03e24445dfcad1b91309199e43017b657ce2604417c12f5',
    signaturePrivateKey: '88bb6f20de8dc1787c722dc847f4cf3d00285b8955445f23c483d1237fe85366',
  },
  {
    accountId: '03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
    signaturePrivateKey: '1eee32d3bc202dcb5d17c3b1454fb541d2290cb941860735408f1bfe39e7bc15',
  },
  {
    accountId: '0351460706cf386282d9b6ebee2ccdcb9ba61194fd024345e53037f3036242e6a2',
    signaturePrivateKey: '434518a2c9a665a7c20da086232c818b6c1592e2edfeecab29a40cf5925ca8fe',
  },
];

type SpaceStorageEntry = {
  id: string;
  events: SpaceEvent[];
  state: SpaceState | undefined;
};

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

export const Route = createFileRoute('/playground')({
  component: () => <ChooseAccount />,
});

const App = ({ accountId, signaturePrivateKey }: { accountId: string; signaturePrivateKey: string }) => {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();
  const [spaces, setSpaces] = useState<SpaceStorageEntry[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    // temporary until we have a way to create accounts and authenticate them
    const websocketConnection = new WebSocket(`ws://localhost:3030/?accountId=${accountId}`);
    setWebsocketConnection(websocketConnection);

    const onMessage = async (event: MessageEvent) => {
      console.log('message received', event.data);
      const data = JSON.parse(event.data);
      const message = decodeResponseMessage(data);
      if (message._tag === 'Right') {
        const response = message.right;
        switch (response.type) {
          case 'list-spaces': {
            setSpaces((existingSpaces) => {
              return response.spaces.map((space) => {
                const existingSpace = existingSpaces.find((s) => s.id === space.id);
                return { id: space.id, events: existingSpace?.events ?? [], state: existingSpace?.state };
              });
            });
            // fetch all spaces (for debugging purposes)
            for (const space of response.spaces) {
              const message: RequestSubscribeToSpace = { type: 'subscribe-space', id: space.id };
              websocketConnection?.send(JSON.stringify(message));
            }
            break;
          }
          case 'space': {
            let state: SpaceState | undefined = undefined;

            // TODO fix typing
            for (const event of response.events) {
              if (state === undefined) {
                const applyEventResult = await Effect.runPromiseExit(applyEvent({ event }));
                if (Exit.isSuccess(applyEventResult)) {
                  state = applyEventResult.value;
                }
              } else {
                const applyEventResult = await Effect.runPromiseExit(applyEvent({ event, state }));
                if (Exit.isSuccess(applyEventResult)) {
                  state = applyEventResult.value;
                }
              }
            }

            const newState = state as SpaceState;

            setSpaces((spaces) =>
              spaces.map((space) => {
                if (space.id === response.id) {
                  // TODO fix readonly type issue
                  return { ...space, events: response.events as SpaceEvent[], state: newState };
                }
                return space;
              }),
            );
            break;
          }
          case 'event': {
            console.log('event', response);
            break;
          }
          case 'list-invitations': {
            setInvitations(response.invitations.map((invitation) => invitation));
            break;
          }
          default:
            assertExhaustive(response);
        }
      }
    };
    websocketConnection.addEventListener('message', onMessage);

    const onOpen = () => {
      console.log('websocket connected');
    };
    websocketConnection.addEventListener('open', onOpen);

    const onError = (event: Event) => {
      console.log('websocket error', event);
    };
    websocketConnection.addEventListener('error', onError);

    const onClose = (event: CloseEvent) => {
      console.log('websocket close', event);
    };
    websocketConnection.addEventListener('close', onClose);

    return () => {
      websocketConnection.removeEventListener('message', onMessage);
      websocketConnection.removeEventListener('open', onOpen);
      websocketConnection.removeEventListener('error', onError);
      websocketConnection.removeEventListener('close', onClose);
      websocketConnection.close();
    };
  }, [accountId]);

  return (
    <>
      <div>
        <Button
          onClick={async () => {
            const spaceEvent = await Effect.runPromise(
              createSpace({
                author: {
                  encryptionPublicKey: 'TODO',
                  signaturePrivateKey,
                  signaturePublicKey: accountId,
                },
              }),
            );
            const message: EventMessage = { type: 'event', event: spaceEvent, spaceId: spaceEvent.transaction.id };
            websocketConnection?.send(JSON.stringify(message));
          }}
        >
          Create space
        </Button>

        <Button
          onClick={() => {
            const message: RequestListSpaces = { type: 'list-spaces' };
            websocketConnection?.send(JSON.stringify(message));
          }}
        >
          List Spaces
        </Button>

        <Button
          onClick={() => {
            const message: RequestListInvitations = { type: 'list-invitations' };
            websocketConnection?.send(JSON.stringify(message));
          }}
        >
          List Invitations
        </Button>
      </div>
      <h2 className="text-lg">Invitations</h2>
      <DebugInvitations invitations={invitations} />
      <h2 className="text-lg">Spaces</h2>
      <ul>
        {spaces.map((space) => {
          return (
            <li key={space.id}>
              <h3>Space id: {space.id}</h3>
              <Button
                onClick={() => {
                  const message: RequestSubscribeToSpace = { type: 'subscribe-space', id: space.id };
                  websocketConnection?.send(JSON.stringify(message));
                }}
              >
                Get data and subscribe to Space
              </Button>
              <br />
              {availableAccounts.map((invitee) => {
                return (
                  <Button
                    key={invitee.accountId}
                    onClick={async () => {
                      if (!space.state) {
                        console.error('No state found for space');
                        return;
                      }
                      const spaceEvent = await Effect.runPromiseExit(
                        createInvitation({
                          author: {
                            signaturePublicKey: accountId,
                            encryptionPublicKey: 'TODO',
                            signaturePrivateKey,
                          },
                          previousEventHash: space.state.lastEventHash,
                          invitee: {
                            signaturePublicKey: invitee.accountId,
                            encryptionPublicKey: 'TODO',
                          },
                        }),
                      );
                      if (Exit.isFailure(spaceEvent)) {
                        console.error('Failed to create invitation', spaceEvent);
                        return;
                      }
                      const message: EventMessage = { type: 'event', event: spaceEvent.value, spaceId: space.id };
                      websocketConnection?.send(JSON.stringify(message));
                    }}
                  >
                    Invite {invitee.accountId.substring(0, 4)}
                  </Button>
                );
              })}
              <h3>State</h3>
              <DebugSpaceState state={space.state} />
              <h3>Events</h3>
              <DebugSpaceEvents events={space.events} />
              <hr />
            </li>
          );
        })}
      </ul>
    </>
  );
};

export const ChooseAccount = () => {
  const [account, setAccount] = useState<{ accountId: string; signaturePrivateKey: string } | null>();

  return (
    <div>
      <h1>Choose account</h1>
      <Button
        onClick={() => {
          setAccount(availableAccounts[0]);
        }}
      >
        {availableAccounts[0].accountId.substring(0, 4)}
      </Button>
      <Button
        onClick={() => {
          setAccount(availableAccounts[1]);
        }}
      >
        {availableAccounts[1].accountId.substring(0, 4)}
      </Button>
      <Button
        onClick={() => {
          setAccount(availableAccounts[2]);
        }}
      >
        {availableAccounts[2].accountId.substring(0, 4)}
      </Button>
      Account: {account?.accountId ? account.accountId : 'none'}
      <hr />
      {account && (
        <App
          // forcing a remount of the App component when the accountId changes
          key={account.accountId}
          accountId={account.accountId}
          signaturePrivateKey={account.signaturePrivateKey}
        />
      )}
    </div>
  );
};
