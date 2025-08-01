import { createServer } from 'node:http';
import { Command, Options } from '@effect/cli';
import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpApiSchema,
  HttpMiddleware,
  HttpServer,
  HttpServerResponse,
} from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { AnsiDoc } from '@effect/printer-ansi';
import { Effect, Layer, Schema } from 'effect';
import * as Typesync from '../services/Typesync.js';

const hypergraphTypeSyncApi = HttpApi.make('HypergraphTypeSyncApi')
  .add(
    HttpApiGroup.make('SchemaStreamGroup')
      .add(
        // exposes an api endpoint at /api/vX/schema/events that is a stream of the current Schema parsed from the directory the hypergraph-cli tool is running in
        HttpApiEndpoint.get('HypergraphSchemaEventStream')`/schema/events`
          .addError(HttpApiError.InternalServerError)
          .addSuccess(
            Schema.String.pipe(
              HttpApiSchema.withEncoding({
                kind: 'Json',
                contentType: 'text/event-stream',
              }),
            ),
          ),
      )
      .prefix('/v1'),
  )
  .prefix('/api');

const hypergraphTypeSyncApiLive = HttpApiBuilder.group(hypergraphTypeSyncApi, 'SchemaStreamGroup', (handlers) =>
  handlers.handle('HypergraphSchemaEventStream', () =>
    Effect.gen(function* () {
      const schemaStream = yield* Typesync.TypesyncSchemaStreamBuilder;

      const stream = yield* schemaStream
        .hypergraphSchemaStream()
        .pipe(Effect.catchAll(() => new HttpApiError.InternalServerError()));

      return yield* HttpServerResponse.stream(stream, { contentType: 'text/event-stream' }).pipe(
        HttpServerResponse.setHeaders({
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        }),
      );
    }),
  ),
);

const HypergraphTypeSyncApiLive = HttpApiBuilder.api(hypergraphTypeSyncApi).pipe(
  Layer.provide(hypergraphTypeSyncApiLive),
  Layer.provide(Typesync.layer),
);

const HypergraphTypeSyncApiLayer = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(HypergraphTypeSyncApiLive),
);

export const typesync = Command.make('typesync', {
  args: {
    port: Options.integer('port').pipe(
      Options.withAlias('p'),
      Options.withDefault(3000),
      Options.withDescription('The port to run the Hypergraph TypeSync studio server on. Default 3000'),
    ),
  },
}).pipe(
  Command.withDescription(
    'Opens the TypeSync studio to help users build and publish their Hypergraph application schema',
  ),
  Command.withHandler(({ args }) =>
    Effect.gen(function* () {
      yield* HypergraphTypeSyncApiLayer.pipe(
        HttpServer.withLogAddress,
        Layer.provide(NodeHttpServer.layer(createServer, { port: args.port })),
        Layer.tap(() =>
          Effect.logInfo(AnsiDoc.text(`🎉 TypeSync studio started and running at http://localhost:${args.port}`)),
        ),
        Layer.launch,
      );
    }),
  ),
);
