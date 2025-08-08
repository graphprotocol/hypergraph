import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { Command, Options } from '@effect/cli';
import {
  FileSystem,
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpApiSchema,
  HttpMiddleware,
  HttpRouter,
  HttpServer,
  HttpServerResponse,
  Path,
} from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { AnsiDoc } from '@effect/printer-ansi';
import { Cause, Data, Effect, Layer, Option, Schema, Struct } from 'effect';
import open, { type AppName, apps } from 'open';
import * as Model from '../services/Model.js';
import * as Typesync from '../services/Typesync.js';

class HypergraphTypesyncStudioApiRouter extends HttpApiGroup.make('HypergraphTypesyncStudioApiRouter')
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
  .add(
    HttpApiEndpoint.post('SyncHypergraphSchema')`/schema/sync`
      .setPayload(Model.TypesyncHypergraphSchema)
      .addSuccess(Model.TypesyncHypergraphSchema)
      .addError(HttpApiError.InternalServerError)
      .addError(HttpApiError.BadRequest),
  )
  .add(
    HttpApiEndpoint.post('SyncHypergraphMapping')`/mapping/sync`
      .setPayload(
        Schema.Struct({
          schema: Model.TypesyncHypergraphSchema,
          mapping: Model.TypesyncHypergraphMapping,
        }),
      )
      .addSuccess(Model.TypesyncHypergraphSchema)
      .addError(HttpApiError.InternalServerError)
      .addError(HttpApiError.BadRequest),
  )
  .prefix('/v1') {}
class HypergraphTypesyncStudioApi extends HttpApi.make('HypergraphTypesyncStudioApi')
  .add(HypergraphTypesyncStudioApiRouter)
  .prefix('/api') {}

const hypergraphTypeSyncApiLive = HttpApiBuilder.group(
  HypergraphTypesyncStudioApi,
  'HypergraphTypesyncStudioApiRouter',
  (handlers) =>
    Effect.gen(function* () {
      const schemaStream = yield* Typesync.TypesyncSchemaStreamBuilder;

      return handlers
        .handle('HypergraphSchemaEventStream', () =>
          Effect.gen(function* () {
            const stream = yield* schemaStream.hypergraphSchemaStream().pipe(
              Effect.tapErrorCause((cause) =>
                Effect.logError(
                  AnsiDoc.cat(
                    AnsiDoc.text('Failure building Hypergraph events stream:'),
                    AnsiDoc.text(Cause.pretty(cause)),
                  ),
                ),
              ),
              Effect.catchAll(() => new HttpApiError.InternalServerError()),
            );

            return yield* HttpServerResponse.stream(stream, { contentType: 'text/event-stream' }).pipe(
              HttpServerResponse.setHeaders({
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              }),
            );
          }),
        )
        .handle('SyncHypergraphSchema', ({ payload }) =>
          schemaStream.syncSchema(payload).pipe(
            Effect.tapErrorCause((cause) =>
              Effect.logError(
                AnsiDoc.cat(AnsiDoc.text('Failure syncing Hypergraph Schema:'), AnsiDoc.text(Cause.pretty(cause))),
              ),
            ),
            Effect.catchAll(() => new HttpApiError.InternalServerError()),
          ),
        )
        .handle('SyncHypergraphMapping', ({ payload }) =>
          schemaStream.syncMapping(payload.schema, payload.mapping).pipe(
            Effect.tapErrorCause((cause) =>
              Effect.logError(
                AnsiDoc.cat(AnsiDoc.text('Failure syncing Hypergraph mapping:'), AnsiDoc.text(Cause.pretty(cause))),
              ),
            ),
            Effect.catchAll(() => new HttpApiError.InternalServerError()),
          ),
        );
    }),
);

const HypergraphTypeSyncApiLayer = HttpApiBuilder.middlewareCors({
  allowedMethods: ['GET', 'POST', 'OPTIONS'],
  allowedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
}).pipe(
  Layer.provideMerge(HttpApiBuilder.api(HypergraphTypesyncStudioApi)),
  Layer.provide(Typesync.layer),
  Layer.provide(hypergraphTypeSyncApiLive),
);

const HypergraphTypeSyncApiLive = HttpApiBuilder.httpApp.pipe(
  Effect.provide(
    Layer.mergeAll(HypergraphTypeSyncApiLayer, HttpApiBuilder.Router.Live, HttpApiBuilder.Middleware.layer),
  ),
);

const TypesyncStudioFileRouter = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Try multiple possible locations for the dist directory
  const possiblePaths = [
    // npm published package (when this file is in node_modules/@graphprotocol/hypergraph/dist/cli/subcommands/)
    path.resolve(__dirname, '..', '..', 'typesync-studio', 'dist'),
    // Development mode (when this file is in packages/hypergraph/src/cli/subcommands/)
    path.resolve(__dirname, '..', '..', '..', 'typesync-studio', 'dist'),
  ];

  const findTypesyncStudioDist = Effect.fnUntraced(function* () {
    return yield* Effect.findFirst(possiblePaths, (_) => fs.exists(_).pipe(Effect.orElseSucceed(() => false)));
  });

  const typesyncStudioClientDist = yield* findTypesyncStudioDist().pipe(
    // default to first path
    Effect.map((maybe) => Option.getOrElse(maybe, () => possiblePaths[0])),
  );

  return HttpRouter.empty.pipe(
    HttpRouter.get(
      '/',
      HttpServerResponse.file(path.join(typesyncStudioClientDist, 'index.html')).pipe(
        Effect.orElse(() => HttpServerResponse.empty({ status: 404 })),
      ),
    ),
    HttpRouter.get(
      '/assets/:file',
      Effect.gen(function* () {
        const file = yield* HttpRouter.params.pipe(Effect.map(Struct.get('file')), Effect.map(Option.fromNullable));

        if (Option.isNone(file)) {
          return HttpServerResponse.empty({ status: 404 });
        }

        const assets = path.join(typesyncStudioClientDist, 'assets');
        const normalized = path.normalize(path.join(assets, ...file.value.split('/')));
        if (!normalized.startsWith(assets)) {
          return HttpServerResponse.empty({ status: 404 });
        }

        return yield* HttpServerResponse.file(normalized);
      }).pipe(Effect.orElse(() => HttpServerResponse.empty({ status: 404 }))),
    ),
  );
});

const Server = Effect.all({
  api: HypergraphTypeSyncApiLive,
  files: TypesyncStudioFileRouter,
}).pipe(
  Effect.map(({ api, files }) =>
    HttpRouter.empty.pipe(HttpRouter.mount('/', files), HttpRouter.mountApp('/api', api, { includePrefix: true })),
  ),
  Effect.map((router) => HttpServer.serve(HttpMiddleware.logger)(router)),
  Layer.unwrapEffect,
);

const openBrowser = (port: number, browser: AppName | 'arc' | 'safari' | 'browser' | 'browserPrivate') =>
  Effect.async<void, OpenBrowserError>((resume) => {
    const url = `http://localhost:${port}`;

    const launch = (appOpts?: { name: string | ReadonlyArray<string> }) =>
      open(url, appOpts ? { app: appOpts } : undefined).then((subprocess) => {
        subprocess.on('spawn', () => resume(Effect.void));
        subprocess.on('error', (err) => resume(Effect.fail(new OpenBrowserError({ cause: err }))));
      });

    const mapBrowserName = (b: typeof browser): string | ReadonlyArray<string> | undefined => {
      switch (b) {
        case 'chrome':
          return apps.chrome; // cross-platform alias from open
        case 'firefox':
          return apps.firefox;
        case 'edge':
          return apps.edge;
        case 'safari':
          return 'Safari';
        case 'arc':
          return 'Arc';
        default:
          return undefined;
      }
    };

    switch (browser) {
      case 'browser':
        launch();
        break;
      case 'browserPrivate':
        launch({ name: apps.browserPrivate });
        break;
      default: {
        const mapped = mapBrowserName(browser);
        if (mapped) {
          launch({ name: mapped }).catch(() => launch());
          break;
        }
        launch();
        break;
      }
    }
  });

export class OpenBrowserError extends Data.TaggedError('Nozzle/cli/studio/errors/OpenBrowserError')<{
  readonly cause: unknown;
}> {}

export const typesync = Command.make('typesync', {
  args: {
    open: Options.boolean('open').pipe(
      Options.withDescription('If true, opens the nozzle dataset studio in your browser'),
      Options.withDefault(true),
    ),
    browser: Options.choice('browser', [
      'chrome',
      'firefox',
      'edge',
      'safari',
      'arc',
      'browser',
      'browserPrivate',
    ]).pipe(
      Options.withAlias('b'),
      Options.withDescription(
        'Broweser to open the nozzle dataset studio app in. Default is your default selected browser',
      ),
      Options.withDefault('browser'),
    ),
  },
}).pipe(
  Command.withDescription(
    'Opens the TypeSync studio to help users build and publish their Hypergraph application schema',
  ),
  Command.withHandler(({ args }) =>
    Effect.gen(function* () {
      yield* Server.pipe(
        HttpServer.withLogAddress,
        Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
        Layer.tap(() =>
          Effect.gen(function* () {
            if (args.open) {
              return yield* openBrowser(3000, args.browser).pipe(
                Effect.tapErrorCause((cause) =>
                  Effect.logWarning(
                    AnsiDoc.text(
                      'Failure opening nozzle dataset studio in your browser. Open at http://localhost:3000',
                    ),
                    AnsiDoc.text(Cause.pretty(cause)),
                  ),
                ),
                Effect.orElseSucceed(() => Effect.void),
              );
            }
            return Effect.void;
          }),
        ),
        Layer.tap(() =>
          Effect.logInfo(AnsiDoc.text('🎉 TypeSync studio started and running at http://localhost:3000')),
        ),
        Layer.launch,
      );
    }),
  ),
  Command.provide(Typesync.layer),
);
