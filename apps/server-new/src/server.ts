import { createServer } from 'node:http';
import * as HttpApiScalar from '@effect/platform/HttpApiScalar';
import * as HttpLayerRouter from '@effect/platform/HttpLayerRouter';
import * as HttpMiddleware from '@effect/platform/HttpMiddleware';
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { serverPortConfig } from './config/server.ts';
import { hypergraphApi } from './http/api.ts';
import { HandlersLive } from './http/handlers.ts';
import * as ConnectionsService from './services/connections.ts';
import { WebSocketLayer } from './websocket.ts';

// Create scalar openapi browser layer at /docs.
const DocsLayer = HttpApiScalar.layerHttpLayerRouter({
  api: hypergraphApi,
  path: '/docs',
});

// Create api layer with openapi.json documentation generated at /docs/openapi.json.
const ApiLayer = HttpLayerRouter.addHttpApi(hypergraphApi, {
  openapiPath: '/docs/openapi.json',
}).pipe(Layer.provide(HandlersLive));

// Merge router layers together and add the cors middleware layer.
const CorsMiddleware = HttpLayerRouter.middleware(HttpMiddleware.cors());
const AppLayer = Layer.mergeAll(ApiLayer, DocsLayer, WebSocketLayer).pipe(Layer.provide(CorsMiddleware.layer));

const HttpServerLayer = serverPortConfig.pipe(
  Effect.map((port) => NodeHttpServer.layer(createServer, { port })),
  Layer.unwrapEffect,
);

export const server = HttpLayerRouter.serve(AppLayer).pipe(
  Layer.provide(HttpServerLayer),
  Layer.provide(ConnectionsService.layer),
);
