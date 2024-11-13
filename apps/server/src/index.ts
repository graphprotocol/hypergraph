import cors from 'cors';
import 'dotenv/config';
import { parse } from 'node:url';
import { Effect, Exit, Schema } from 'effect';
import express from 'express';
import type { ResponseListSpaces, ResponseSpace } from 'graph-framework-messages';
import { RequestMessage } from 'graph-framework-messages';
import { type CreateSpaceEvent, applyEvent } from 'graph-framework-space-events';
import type WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { createSpace } from './handlers/createSpace.js';
import { getSpace } from './handlers/getSpace.js';
import { listSpaces } from './handlers/listSpaces.js';
import { tmpInitAccount } from './handlers/tmpInitAccount.js';
import { assertExhaustive } from './utils/assertExhaustive.js';

const decodeRequestMessage = Schema.decodeUnknownEither(RequestMessage);

tmpInitAccount('0262701b2eb1b6b37ad03e24445dfcad1b91309199e43017b657ce2604417c12f5');
tmpInitAccount('03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462');
tmpInitAccount('0351460706cf386282d9b6ebee2ccdcb9ba61194fd024345e53037f3036242e6a2');

const webSocketServer = new WebSocketServer({ noServer: true });
const PORT = process.env.PORT !== undefined ? Number.parseInt(process.env.PORT) : 3030;
const app = express();

app.use(express.json());

app.use(cors());

app.get('/', (_req, res) => {
  res.send('Server is running');
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

webSocketServer.on('connection', async (webSocket: WebSocket, request: Request) => {
  const params = parse(request.url, true);
  if (!params.query.accountId || typeof params.query.accountId !== 'string') {
    webSocket.close();
    return;
  }
  const accountId = params.query.accountId;

  console.log('Connection established', accountId);
  webSocket.on('message', async (message) => {
    const rawData = JSON.parse(message.toString());
    const result = decodeRequestMessage(rawData);
    if (result._tag === 'Right') {
      const data = result.right;
      switch (data.type) {
        case 'subscribe-space': {
          const space = await getSpace({ accountId, spaceId: data.id });
          const outgoingMessage: ResponseSpace = {
            type: 'space',
            id: space.id,
            events: space.events.map((wrapper) => JSON.parse(wrapper.event)),
          };
          webSocket.send(JSON.stringify(outgoingMessage));
          break;
        }
        case 'list-spaces': {
          const spaces = await listSpaces({ accountId });
          const outgoingMessage: ResponseListSpaces = { type: 'list-spaces', spaces: spaces };
          webSocket.send(JSON.stringify(outgoingMessage));
          break;
        }
        case 'event': {
          switch (data.event.transaction.type) {
            case 'create-space': {
              const applyEventResult = await Effect.runPromiseExit(applyEvent({ event: data.event }));
              if (Exit.isSuccess(applyEventResult)) {
                const space = await createSpace({ accountId, event: data.event as CreateSpaceEvent });
                const spaceWithEvents = await getSpace({ accountId, spaceId: space.id });
                const outgoingMessage: ResponseSpace = {
                  type: 'space',
                  id: space.id,
                  events: spaceWithEvents.events.map((wrapper) => JSON.parse(wrapper.event)),
                };
                webSocket.send(JSON.stringify(outgoingMessage));
              }
              // TODO send back error
              break;
            }
            case 'delete-space': {
              break;
            }
            case 'create-invitation': {
              break;
            }
          }
          break;
        }
        default:
          assertExhaustive(data);
          break;
      }
    }
  });
  webSocket.on('close', () => {
    console.log('Connection closed');
  });
});

server.on('upgrade', async (request, socket, head) => {
  webSocketServer.handleUpgrade(request, socket, head, (currentSocket) => {
    webSocketServer.emit('connection', currentSocket, request);
  });
});
