import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import * as HttpApiScalar from '@effect/platform/HttpApiScalar';
import * as HttpLayerRouter from '@effect/platform/HttpLayerRouter';
import * as HttpMiddleware from '@effect/platform/HttpMiddleware';
import * as HttpServerRequest from '@effect/platform/HttpServerRequest';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Mailbox from 'effect/Mailbox';
import * as Stream from 'effect/Stream';
import { createServer } from 'node:http';
import { serverPortConfig } from './config/server.ts';
import { hypergraphApi } from './http/api.ts';
import { HandlersLive } from './http/handlers.ts';

// Create scalar openapi browser layer at /docs.
const DocsLayer = HttpApiScalar.layerHttpLayerRouter({
  api: hypergraphApi,
  path: '/docs',
});

// Create api layer with openapi.json documentation generated at /docs/openapi.json.
const ApiLayer = HttpLayerRouter.addHttpApi(hypergraphApi, {
  openapiPath: '/docs/openapi.json',
}).pipe(Layer.provide(HandlersLive));

type OutgoingMessage = {
  type: 'message';
  message: string;
};

// Create websocket layer at /ws.
const WebSocketLayer = HttpLayerRouter.add(
  'GET',
  '/ws',
  Effect.gen(function* () {
    const outgoingMailbox = yield* Mailbox.make<OutgoingMessage>();
    const incomingMailbox = yield* Mailbox.make<OutgoingMessage>();

    yield* outgoingMailbox.offer({ type: 'message', message: 'Hello, world!' });

    // TODO: Implement actual websocket logic here.
    return yield* Mailbox.toStream(outgoingMailbox).pipe(
      Stream.map(JSON.stringify),
      Stream.pipeThroughChannel(HttpServerRequest.upgradeChannel()),
      Stream.decodeText(),
      Stream.runForEach((_) => Effect.log(_)),
      Effect.as(HttpServerResponse.empty()),
    );
  }),
);

// Merge router layers together and add the cors middleware layer.
const CorsMiddleware = HttpLayerRouter.middleware(HttpMiddleware.cors());
const AppLayer = Layer.mergeAll(ApiLayer, DocsLayer, WebSocketLayer).pipe(Layer.provide(CorsMiddleware.layer));

const HttpServerLayer = serverPortConfig.pipe(
  Effect.map((port) => NodeHttpServer.layer(createServer, { port })),
  Layer.unwrapEffect,
);

export const server = HttpLayerRouter.serve(AppLayer).pipe(Layer.provide(HttpServerLayer));
