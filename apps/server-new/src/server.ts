import { HttpApiBuilder, HttpServer } from '@effect/platform';
import { NodeHttpServer } from '@effect/platform-node';
import { Effect, Layer } from 'effect';
import { createServer } from 'node:http';
import { serverPortConfig } from './config/server.ts';
import { hypergraphApi } from './http/api.ts';
import { HandlersLive } from './http/handlers.ts';
import { AccountInboxServiceLive } from './services/account-inbox.ts';
import { AppIdentityServiceLive } from './services/app-identity.ts';
import { ConnectIdentityServiceLive } from './services/connect-identity.ts';
import { DatabaseServiceLive } from './services/database.ts';
import { IdentityServiceLive } from './services/identity.ts';
import { PrivyAuthServiceLive } from './services/privy-auth.ts';
import { SpaceInboxServiceLive } from './services/space-inbox.ts';
import { SpacesServiceLive } from './services/spaces.ts';

const ServicesLive = Layer.mergeAll(
  DatabaseServiceLive,
  Layer.provide(
    AccountInboxServiceLive,
    Layer.mergeAll(Layer.provide(IdentityServiceLive, DatabaseServiceLive), DatabaseServiceLive),
  ),
  Layer.provide(AppIdentityServiceLive, DatabaseServiceLive),
  Layer.provide(ConnectIdentityServiceLive, DatabaseServiceLive),
  Layer.provide(IdentityServiceLive, DatabaseServiceLive),
  Layer.provide(PrivyAuthServiceLive, DatabaseServiceLive),
  Layer.provide(
    SpaceInboxServiceLive,
    Layer.mergeAll(Layer.provide(IdentityServiceLive, DatabaseServiceLive), DatabaseServiceLive),
  ),
  Layer.provide(
    SpacesServiceLive,
    Layer.mergeAll(DatabaseServiceLive, Layer.provide(IdentityServiceLive, DatabaseServiceLive)),
  ),
);

const apiLive = HttpApiBuilder.api(hypergraphApi).pipe(Layer.provide(HandlersLive), Layer.provide(ServicesLive));

export const server = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* serverPortConfig;
    return HttpApiBuilder.serve().pipe(
      Layer.provide(apiLive),
      HttpServer.withLogAddress,
      Layer.provide(NodeHttpServer.layer(createServer, { port })),
    );
  }),
);
