/** Defines the /api/vX endpoints made available to the client for interacting with the user apps */

import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpApiScalar,
  HttpApiSchema,
  HttpServerRequest,
  OpenApi,
} from '@effect/platform';
import { Console, Effect, Layer, Option, Schema } from 'effect';

import * as Database from './Database.js';
import * as Domain from './Domain.js';
import * as SchemaGenerator from './Generator.js';

const idParam = HttpApiSchema.param('id', Schema.NumberFromString.pipe(Schema.int(), Schema.positive()));
class ApiRouter extends HttpApiGroup.make('Api')
  .add(HttpApiEndpoint.get('CWD')`/cwd`.addSuccess(Schema.Struct({ cwd: Schema.NonEmptyTrimmedString })))
  .annotateContext(
    OpenApi.annotations({
      title: 'CWD',
      description: 'Current working directory where the TypeSync CLI is running',
      version: 'v1',
    }),
  )
  .add(
    HttpApiEndpoint.get('FetchApps')`/apps`
      .addSuccess(Schema.Array(Domain.App))
      .addError(HttpApiError.InternalServerError),
  )
  .add(
    HttpApiEndpoint.get('FetchAppById')`/apps/${idParam}`
      .addSuccess(Schema.NullOr(Domain.AppSchema))
      .addError(HttpApiError.InternalServerError)
      .addError(HttpApiError.NotFound),
  )
  .add(
    HttpApiEndpoint.post('CreateApp')`/apps`
      // .setPayload(Domain.InsertAppSchema)
      .addSuccess(Domain.AppSchema)
      .addError(HttpApiError.InternalServerError)
      .addError(HttpApiError.BadRequest)
      .annotateContext(
        OpenApi.annotations({
          title: 'Create App',
          description: 'Create an app record with associated schema',
          version: 'v1',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('DeleteApp')`/apps/${idParam}`
      .addSuccess(Schema.Boolean)
      .addError(HttpApiError.InternalServerError),
  )
  .add(
    HttpApiEndpoint.get('FetchAppEvents')`/apps/${idParam}/events`
      .addSuccess(Schema.Array(Domain.AppEvent))
      .addError(HttpApiError.InternalServerError),
  )
  .add(
    HttpApiEndpoint.get('FetchAppSchema')`/apps/${idParam}/schema`
      .addSuccess(Domain.AppSchema.pipe(Schema.pick('types')))
      .addError(HttpApiError.InternalServerError)
      .addError(HttpApiError.NotFound),
  )
  .prefix('/v1') {}

class Api extends HttpApi.make('TypeSyncApi').add(ApiRouter).prefix('/api') {}

const ApiAppsLive = HttpApiBuilder.group(Api, 'Api', (handlers) =>
  Effect.gen(function* () {
    const db = yield* Database.DatabaseService;
    const generator = yield* SchemaGenerator.SchemaGenerator;

    return handlers
      .handle('CWD', () => Effect.succeed({ cwd: process.cwd() }))
      .handle('FetchApps', (_) =>
        db.Apps.fetchAll().pipe(
          Effect.tapError((err) => Console.error('GET /v1/apps - failure fetching apps', { err })),
          Effect.mapError(() => new HttpApiError.InternalServerError()),
        ),
      )
      .handle('FetchAppById', ({ path }) =>
        db.Apps.fetchById(path.id).pipe(
          Effect.tapError((err) => Console.error(`GET /v1/apps/${path.id} - failure fetching app`, { err })),
          Effect.map((_app) =>
            Option.match(_app, {
              onNone() {
                return null;
              },
              onSome(found) {
                return found;
              },
            }),
          ),
          Effect.mapError((_) => new HttpApiError.InternalServerError()),
        ),
      )
      .handle('CreateApp', () =>
        Effect.gen(function* () {
          const body = yield* HttpServerRequest.HttpServerRequest.pipe(
            Effect.flatMap((req) => req.json),
            Effect.tapError((err) => Console.error('Apps.CreateApp() failure parsing InsertApp request JSON', { err })),
            Effect.catchAll(() => new HttpApiError.BadRequest()),
          );

          const payload = Schema.decodeUnknownSync(Domain.InsertAppSchema)(body);

          return yield* db.Apps.create(payload).pipe(
            Effect.tapError((err) => Console.error('POST /v1/apps - failure creating app schema', { err })),
            Effect.mapError((_) => new HttpApiError.InternalServerError()),
            Effect.tap((app) =>
              // generate the files in the given directory
              generator
                .codegen(payload)
                .pipe(
                  Effect.tap(({ directory }) =>
                    db.AppEvents.create({
                      app_id: app.id,
                      event_type: 'generated',
                      metadata: `App "${app.name}" initial codegen completed and generated "${directory}"`,
                    }),
                  ),
                  Effect.tapError((err) =>
                    Effect.gen(function* () {
                      yield* Console.error('POST /v1/apps - failure generating app files', { err });
                      // delete the app and related types if the codegen fails
                      yield* db.Apps.delete(app.id);
                    }),
                  ),
                  Effect.mapError((_) => new HttpApiError.InternalServerError()),
                ),
            ),
          );
        }),
      )
      .handle('DeleteApp', ({ path }) =>
        db.Apps.delete(path.id).pipe(
          Effect.tapError((err) =>
            Console.error(`DELETE /v1/apps/${path.id} - failure deleting app, and related records`, { err }),
          ),
          Effect.mapError((_) => new HttpApiError.InternalServerError()),
        ),
      )
      .handle('FetchAppEvents', ({ path }) =>
        db.AppEvents.fetchAppEvents(path.id).pipe(
          Effect.tapError((err) =>
            Console.error(`GET /v1/apps/${path.id}/events - failure fetching app events`, { err }),
          ),
          Effect.mapError((_) => new HttpApiError.InternalServerError()),
        ),
      )
      .handle('FetchAppSchema', ({ path }) =>
        db.AppSchema.fetchAppSchema(path.id).pipe(
          Effect.tapError((err) =>
            Console.error(`GET /v1/apps/${path.id}/schema - failure fetching app schema`, { err }),
          ),
          Effect.mapError((_) => new HttpApiError.InternalServerError()),
        ),
      );
  }),
);

export const ApiLayer = Layer.merge(HttpApiBuilder.middlewareCors(), HttpApiScalar.layer({ path: '/api/docs' })).pipe(
  Layer.provideMerge(HttpApiBuilder.api(Api)),
  Layer.provide(Database.DatabaseServiceLive),
  Layer.provide(SchemaGenerator.SchemaGeneratorLayer),
  Layer.provide(ApiAppsLive),
);

export const ApiLive = HttpApiBuilder.httpApp.pipe(
  Effect.provide(Layer.mergeAll(ApiLayer, HttpApiBuilder.Router.Live, HttpApiBuilder.Middleware.layer)),
);
