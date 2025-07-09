/** Defines the static file routes for serving the client dist directory with the built vite/react app */
import { fileURLToPath } from 'node:url';

import { HttpMiddleware, HttpRouter, HttpServer, HttpServerResponse, Path } from '@effect/platform';
import { Effect, String as EffectString, Layer, Option, Struct } from 'effect';

import * as Api from './Api.js';

const FilesRouter = Effect.gen(function* () {
  const path = yield* Path.Path;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  /**
   * This resolves an issue when running the cli in dev mode locally vs published mode.
   * In local dev mode, the __dirname will end with `src` as this file will be ran from the ./src directory.
   * When running in the compiled dist mode, the __dirname will end with `dist`.
   *
   * @todo clean this up and figure out a better way to derive
   */
  const isLocal = EffectString.endsWith('src')(__dirname);
  const clientdist = isLocal
    ? path.resolve(__dirname, '..', 'client', 'dist')
    : path.resolve(__dirname, 'client', 'dist');

  return HttpRouter.empty.pipe(
    HttpRouter.get(
      '/',
      HttpServerResponse.file(path.join(clientdist, 'index.html')).pipe(
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

        const assets = path.join(clientdist, 'assets');
        const normalized = path.normalize(path.join(assets, ...file.value.split('/')));
        if (!normalized.startsWith(assets)) {
          return HttpServerResponse.empty({ status: 404 });
        }

        return yield* HttpServerResponse.file(normalized);
      }).pipe(Effect.orElse(() => HttpServerResponse.empty({ status: 404 }))),
    ),
  );
});

export const Server = Effect.all({
  api: Api.ApiLive,
  files: FilesRouter,
}).pipe(
  Effect.map(({ api, files }) =>
    HttpRouter.empty.pipe(HttpRouter.mount('/', files), HttpRouter.mountApp('/api', api, { includePrefix: true })),
  ),
  Effect.map((router) => HttpServer.serve(HttpMiddleware.logger)(router)),
  Layer.unwrapEffect,
);
