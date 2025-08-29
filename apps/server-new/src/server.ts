import { createServer } from 'node:http';
import { HttpApiBuilder, HttpServer } from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { Effect, Layer } from 'effect';
import { serverPortConfig } from './config/server.ts';
import { hypergraphApi } from './http/api.ts';
import { HandlersLive } from './http/handlers.ts';

const apiLive = HttpApiBuilder.api(hypergraphApi).pipe(Layer.provide(HandlersLive));

export const server = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* serverPortConfig;
    return HttpApiBuilder.serve().pipe(
      Layer.provide(HttpApiBuilder.middlewareCors()),
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(NodeHttpServer.layer(createServer, { port })),
    );
  }),
);
