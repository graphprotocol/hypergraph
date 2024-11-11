import { Button } from '@/components/ui/button';
import { assertExhaustive } from '@/lib/assertExhaustive';
import { createFileRoute } from '@tanstack/react-router';
import * as Schema from 'effect/Schema';
import type { EventMessage, RequestListSpaces, RequestSubscribeToSpace } from 'graph-framework';
import { ResponseMessage, createIdentity, createSpace } from 'graph-framework';
import { useEffect, useState } from 'react';

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

export const Route = createFileRoute('/playground')({
  component: () => <ChooseAccount />,
});

const App = ({ accountId }: { accountId: string }) => {
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
          onClick={() => {
            const identity = createIdentity();
            const spaceEvent = createSpace({ author: identity });
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
  const [accountId, setAccountId] = useState<string | null>();

  return (
    <div>
      <h1>Choose account</h1>
      <Button
        onClick={() => {
          setAccountId('abc');
        }}
      >
        `abc`
      </Button>
      <Button
        onClick={() => {
          setAccountId('cde');
        }}
      >
        `cde`
      </Button>
      <Button
        onClick={() => {
          setAccountId('def');
        }}
      >
        `def`
      </Button>
      Account: {accountId ? accountId : 'none'}
      <hr />
      {accountId && (
        <App
          // forcing a remount of the App component when the accountId changes
          key={accountId}
          accountId={accountId}
        />
      )}
    </div>
  );
};
