import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import * as HttpApiScalar from '@effect/platform/HttpApiScalar';
import * as HttpLayerRouter from '@effect/platform/HttpLayerRouter';
import * as HttpMiddleware from '@effect/platform/HttpMiddleware';
import * as HttpServerRequest from '@effect/platform/HttpServerRequest';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import { isArray } from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Mailbox from 'effect/Mailbox';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';
import { createServer } from 'node:http';
import { serverPortConfig } from './config/server.ts';
import { hypergraphApi } from './http/api.ts';
import { HandlersLive } from './http/handlers.ts';
import * as AppIdentityService from './services/app-identity.ts';

// Create scalar openapi browser layer at /docs.
const DocsLayer = HttpApiScalar.layerHttpLayerRouter({
  api: hypergraphApi,
  path: '/docs',
});

// Create api layer with openapi.json documentation generated at /docs/openapi.json.
const ApiLayer = HttpLayerRouter.addHttpApi(hypergraphApi, {
  openapiPath: '/docs/openapi.json',
}).pipe(Layer.provide(HandlersLive));

const Domain = {
  Request: Schema.Struct({
    type: Schema.String,
    message: Schema.String,
  }),
  Response: Schema.Struct({
    type: Schema.String,
    message: Schema.String,
  }),
};

type Request = Schema.Schema.Type<typeof Domain.Request>;

const WebSocketLayer = HttpLayerRouter.add(
  'GET',
  '/',
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;

    const searchParams = HttpServerRequest.searchParamsFromURL(new URL(request.url, 'http://localhost'));
    const token = isArray(searchParams.token) ? searchParams.token[0] : searchParams.token;

    if (!token) {
      return yield* HttpServerResponse.empty({ status: 400 });
    }

    const appIdentityService = yield* AppIdentityService.AppIdentityService;
    const { accountAddress } = yield* appIdentityService.getBySessionToken(token).pipe(Effect.orDie);

    yield* Effect.log(accountAddress);

    const requests = yield* Mailbox.make<Request>();

    yield* requests.offer({ type: 'message', message: 'Hello, world!' });

    return yield* Mailbox.toStream(requests).pipe(
      Stream.map(JSON.stringify),
      Stream.pipeThroughChannel(HttpServerRequest.upgradeChannel()),
      Stream.decodeText(),
      Stream.runForEach((message) =>
        Effect.gen(function* () {
          yield* Effect.log('RECEIVED: ' + message);
          yield* requests.offer({ type: 'message', message: 'RECEIVED' });
        }),
      ),
      Effect.as(HttpServerResponse.empty()),
    );
  }).pipe(Effect.provide(AppIdentityService.layer)),
);

// Merge router layers together and add the cors middleware layer.
const CorsMiddleware = HttpLayerRouter.middleware(HttpMiddleware.cors());
const AppLayer = Layer.mergeAll(ApiLayer, DocsLayer, WebSocketLayer).pipe(Layer.provide(CorsMiddleware.layer));

const HttpServerLayer = serverPortConfig.pipe(
  Effect.map((port) => NodeHttpServer.layer(createServer, { port })),
  Layer.unwrapEffect,
);

export const server = HttpLayerRouter.serve(AppLayer).pipe(Layer.provide(HttpServerLayer));
