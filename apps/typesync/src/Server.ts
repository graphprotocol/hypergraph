/** Defines the static file routes for serving the client dist directory with the built vite/react app */

import * as NodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import * as HttpMiddleware from '@effect/platform/HttpMiddleware';
import * as HttpRouter from '@effect/platform/HttpRouter';
import * as HttpServer from '@effect/platform/HttpServer';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Struct from 'effect/Struct';

import * as Api from './Api.js';

const __dirname = NodePath.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST_DIR = NodePath.resolve(__dirname, 'client', 'dist');

const FilesRouter = Effect.gen(function* () {
  return HttpRouter.empty.pipe(
    HttpRouter.get(
      '/',
      HttpServerResponse.file(NodePath.join(CLIENT_DIST_DIR, 'index.html')).pipe(
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

        const assets = NodePath.join(CLIENT_DIST_DIR, 'assets');
        const normalized = NodePath.normalize(NodePath.join(assets, ...file.value.split('/')));
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
