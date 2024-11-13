import { Button } from '@/components/ui/button';
import { assertExhaustive } from '@/lib/assertExhaustive';
import { createFileRoute } from '@tanstack/react-router';
import { Effect } from 'effect';
import * as Schema from 'effect/Schema';
import type { EventMessage, RequestListSpaces, RequestSubscribeToSpace } from 'graph-framework';
import { ResponseMessage, createSpace } from 'graph-framework';
import { useEffect, useState } from 'react';

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

export const Route = createFileRoute('/playground')({
  component: () => <ChooseAccount />,
});

const App = ({ accountId, signaturePrivateKey }: { accountId: string; signaturePrivateKey: string }) => {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();
  const [spaces, setSpaces] = useState<{ id: string }[]>([]);

  useEffect(() => {
    // temporary until we have a way to create accounts and authenticate them
    const websocketConnection = new WebSocket(`ws://localhost:3030/?accountId=${accountId}`);
    setWebsocketConnection(websocketConnection);

    const onMessage = (event: MessageEvent) => {
      console.log('message received', event.data);
      const data = JSON.parse(event.data);
      const message = decodeResponseMessage(data);
      if (message._tag === 'Right') {
        const response = message.right;
        switch (response.type) {
          case 'list-spaces': {
            setSpaces(response.spaces.map((space) => ({ id: space.id })));
            break;
          }
          case 'space': {
            console.log('space', response);
            break;
          }
          case 'event': {
            console.log('event', response);
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
            const message: EventMessage = { type: 'event', event: spaceEvent };
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
      </div>
      <h2>Spaces</h2>
      <ul>
        {spaces.map((space) => {
          return (
            <li key={space.id}>
              <h3>{space.id}</h3>
              <Button
                onClick={() => {
                  const message: RequestSubscribeToSpace = { type: 'subscribe-space', id: space.id };
                  websocketConnection?.send(JSON.stringify(message));
                }}
              >
                Get data and subscribe to Space
              </Button>
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
          setAccount({
            accountId: '0262701b2eb1b6b37ad03e24445dfcad1b91309199e43017b657ce2604417c12f5',
            signaturePrivateKey: '88bb6f20de8dc1787c722dc847f4cf3d00285b8955445f23c483d1237fe85366',
          });
        }}
      >
        `abc`
      </Button>
      <Button
        onClick={() => {
          setAccount({
            accountId: '03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
            signaturePrivateKey: '1eee32d3bc202dcb5d17c3b1454fb541d2290cb941860735408f1bfe39e7bc15',
          });
        }}
      >
        `cde`
      </Button>
      <Button
        onClick={() => {
          setAccount({
            accountId: '0351460706cf386282d9b6ebee2ccdcb9ba61194fd024345e53037f3036242e6a2',
            signaturePrivateKey: '434518a2c9a665a7c20da086232c818b6c1592e2edfeecab29a40cf5925ca8fe',
          });
        }}
      >
        `def`
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
