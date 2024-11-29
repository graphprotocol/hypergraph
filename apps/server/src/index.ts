import cors from 'cors';
import 'dotenv/config';
import { parse } from 'node:url';
import type {
  ResponseListInvitations,
  ResponseListSpaces,
  ResponseSpace,
  ResponseSpaceEvent,
  ResponseUpdateConfirmed,
  ResponseUpdatesNotification,
  Updates,
} from '@graph-framework/messages';
import { RequestMessage, deserialize, serialize } from '@graph-framework/messages';
import type { SpaceEvent } from '@graph-framework/space-events';
import { applyEvent } from '@graph-framework/space-events';
import { Effect, Exit, Schema } from 'effect';
import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import { applySpaceEvent } from './handlers/applySpaceEvent.js';
import { createSpace } from './handlers/createSpace.js';
import { createUpdate } from './handlers/createUpdate.js';
import { getSpace } from './handlers/getSpace.js';
import { listInvitations } from './handlers/listInvitations.js';
import { listSpaces } from './handlers/listSpaces.js';
import { tmpInitAccount } from './handlers/tmpInitAccount.js';
import { assertExhaustive } from './utils/assertExhaustive.js';
interface CustomWebSocket extends WebSocket {
  accountId: string;
  subscribedSpaces: Set<string>;
}

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

function broadcastSpaceEvents({
  spaceId,
  event,
  currentClient,
}: { spaceId: string; event: SpaceEvent; currentClient: CustomWebSocket }) {
  for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
    if (currentClient === client) continue;

    const outgoingMessage: ResponseSpaceEvent = {
      type: 'space-event',
      spaceId,
      event,
    };
    if (client.readyState === WebSocket.OPEN && client.subscribedSpaces.has(spaceId)) {
      client.send(serialize(outgoingMessage));
    }
  }
}

function broadcastUpdates({
  spaceId,
  updates,
  currentClient,
}: { spaceId: string; updates: Updates; currentClient: CustomWebSocket }) {
  for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
    if (currentClient === client) continue;

    const outgoingMessage: ResponseUpdatesNotification = {
      type: 'updates-notification',
      updates,
      spaceId,
    };
    if (client.readyState === WebSocket.OPEN && client.subscribedSpaces.has(spaceId)) {
      client.send(serialize(outgoingMessage));
    }
  }
}

webSocketServer.on('connection', async (webSocket: CustomWebSocket, request: Request) => {
  const params = parse(request.url, true);
  if (!params.query.accountId || typeof params.query.accountId !== 'string') {
    webSocket.close();
    return;
  }
  const accountId = params.query.accountId;
  webSocket.accountId = accountId;
  webSocket.subscribedSpaces = new Set();

  console.log('Connection established', accountId);
  webSocket.on('message', async (message) => {
    const rawData = deserialize(message.toString());
    const result = decodeRequestMessage(rawData);
    if (result._tag === 'Right') {
      const data = result.right;
      switch (data.type) {
        case 'subscribe-space': {
          const space = await getSpace({ accountId, spaceId: data.id });
          const outgoingMessage: ResponseSpace = {
            ...space,
            type: 'space',
          };
          webSocket.subscribedSpaces.add(data.id);
          webSocket.send(serialize(outgoingMessage));
          break;
        }
        case 'list-spaces': {
          const spaces = await listSpaces({ accountId });
          const outgoingMessage: ResponseListSpaces = { type: 'list-spaces', spaces: spaces };
          webSocket.send(serialize(outgoingMessage));
          break;
        }
        case 'list-invitations': {
          const invitations = await listInvitations({ accountId });
          const outgoingMessage: ResponseListInvitations = { type: 'list-invitations', invitations: invitations };
          webSocket.send(serialize(outgoingMessage));
          break;
        }
        case 'create-space-event': {
          const applyEventResult = await Effect.runPromiseExit(applyEvent({ event: data.event, state: undefined }));
          if (Exit.isSuccess(applyEventResult)) {
            const space = await createSpace({ accountId, event: data.event, keyBox: data.keyBox, keyId: data.keyId });
            const spaceWithEvents = await getSpace({ accountId, spaceId: space.id });
            const outgoingMessage: ResponseSpace = {
              ...spaceWithEvents,
              type: 'space',
            };
            webSocket.send(serialize(outgoingMessage));
          }
          // TODO send back error
          break;
        }
        case 'create-invitation-event': {
          await applySpaceEvent({
            accountId,
            spaceId: data.spaceId,
            event: data.event,
            keyBoxes: data.keyBoxes.map((keyBox) => keyBox),
          });
          const spaceWithEvents = await getSpace({ accountId, spaceId: data.spaceId });
          // TODO send back confirmation instead of the entire space
          const outgoingMessage: ResponseSpace = {
            ...spaceWithEvents,
            type: 'space',
          };
          webSocket.send(serialize(outgoingMessage));
          for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
            if (
              client.readyState === WebSocket.OPEN &&
              client.accountId === data.event.transaction.signaturePublicKey
            ) {
              const invitations = await listInvitations({ accountId: client.accountId });
              const outgoingMessage: ResponseListInvitations = { type: 'list-invitations', invitations: invitations };
              // for now sending the entire list of invitations to the client - we could send only a single one
              client.send(serialize(outgoingMessage));
            }
          }

          broadcastSpaceEvents({ spaceId: data.spaceId, event: data.event, currentClient: webSocket });
          break;
        }
        case 'accept-invitation-event': {
          await applySpaceEvent({ accountId, spaceId: data.spaceId, event: data.event, keyBoxes: [] });
          const spaceWithEvents = await getSpace({ accountId, spaceId: data.spaceId });
          const outgoingMessage: ResponseSpace = {
            ...spaceWithEvents,
            type: 'space',
          };
          webSocket.send(serialize(outgoingMessage));
          broadcastSpaceEvents({ spaceId: data.spaceId, event: data.event, currentClient: webSocket });
          break;
        }
        case 'create-update': {
          const update = await createUpdate({ accountId, spaceId: data.spaceId, update: data.update });
          const outgoingMessage: ResponseUpdateConfirmed = {
            type: 'update-confirmed',
            ephemeralId: data.ephemeralId,
            clock: update.clock,
            spaceId: data.spaceId,
          };
          webSocket.send(serialize(outgoingMessage));

          broadcastUpdates({
            spaceId: data.spaceId,
            updates: {
              updates: [new Uint8Array(update.content)],
              firstUpdateClock: update.clock,
              lastUpdateClock: update.clock,
            },
            currentClient: webSocket,
          });
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
