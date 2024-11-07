import { Button } from '@/components/ui/button';
import { createFileRoute } from '@tanstack/react-router';
import { createIdentity, createSpace } from 'graph-framework';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/playground')({
  component: () => <Playground />,
});

const Playground = () => {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();

  useEffect(() => {
    const websocketConnection = new WebSocket(`ws://localhost:3030/`);
    setWebsocketConnection(websocketConnection);

    const onMessage = (event: MessageEvent) => {
      console.log('message received', event.data);
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
  }, []);

  return (
    <div>
      <Button
        onClick={() => {
          const identity = createIdentity();
          const spaceEvent = createSpace({ author: identity });
          websocketConnection?.send(JSON.stringify(spaceEvent));
        }}
      >
        Create space
      </Button>
    </div>
  );
};
