import cors from 'cors';
import 'dotenv/config';
import { Schema } from 'effect';
import express from 'express';
import { SpaceEvent } from 'graph-framework-space-events';
import type WebSocket from 'ws';
import { WebSocketServer } from 'ws';

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

const decodeEvent = Schema.decodeUnknownEither(SpaceEvent);

webSocketServer.on('connection', async (webSocket: WebSocket) => {
  console.log('Connection established');
  webSocket.on('message', async (message) => {
    const rawData = JSON.parse(message.toString());
    const result = decodeEvent(rawData);
    if (result._tag === 'Right') {
      const data = result.right;
      console.log('Message received', data);
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
