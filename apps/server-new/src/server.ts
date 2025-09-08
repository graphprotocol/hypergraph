import { createServer } from 'node:http';
import * as HttpApiScalar from '@effect/platform/HttpApiScalar';
import * as HttpLayerRouter from '@effect/platform/HttpLayerRouter';
import * as HttpMiddleware from '@effect/platform/HttpMiddleware';
import * as HttpServerRequest from '@effect/platform/HttpServerRequest';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import * as Socket from '@effect/platform/Socket';
import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import { Messages } from '@graphprotocol/hypergraph';
import { isArray } from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Mailbox from 'effect/Mailbox';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';
import { serverPortConfig } from './config/server.ts';
import { hypergraphApi } from './http/api.ts';
import { HandlersLive } from './http/handlers.ts';
import * as AppIdentityService from './services/app-identity.ts';
import * as ConnectionsService from './services/connections.ts';
import * as IdentityService from './services/identity.ts';
import * as InvitationsService from './services/invitations.ts';
import * as SpacesService from './services/spaces.ts';
import * as UpdatesService from './services/updates.ts';

// Create scalar openapi browser layer at /docs.
const DocsLayer = HttpApiScalar.layerHttpLayerRouter({
  api: hypergraphApi,
  path: '/docs',
});

// Create api layer with openapi.json documentation generated at /docs/openapi.json.
const ApiLayer = HttpLayerRouter.addHttpApi(hypergraphApi, {
  openapiPath: '/docs/openapi.json',
}).pipe(Layer.provide(HandlersLive));

const decodeRequestMessage = Schema.decodeUnknownEither(Messages.RequestMessage);

const WebSocketLayer = HttpLayerRouter.add(
  'GET',
  '/',
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const spacesService = yield* SpacesService.SpacesService;
    const invitationsService = yield* InvitationsService.InvitationsService;
    const updatesService = yield* UpdatesService.UpdatesService;
    const connectionsService = yield* ConnectionsService.ConnectionsService;
    const responseMailbox = yield* Mailbox.make<Messages.ResponseMessage>();

    const searchParams = HttpServerRequest.searchParamsFromURL(new URL(request.url, 'http://localhost'));
    const token = isArray(searchParams.token) ? searchParams.token[0] : searchParams.token;

    if (!token) {
      return yield* HttpServerResponse.empty({ status: 400 });
    }

    const appIdentityService = yield* AppIdentityService.AppIdentityService;
    const identityService = yield* IdentityService.IdentityService;
    const { accountAddress, address } = yield* appIdentityService.getBySessionToken(token).pipe(Effect.orDie);

    // Register this connection
    const connectionId = yield* connectionsService.registerConnection({
      accountAddress,
      appIdentityAddress: address,
      mailbox: responseMailbox,
    });

    return yield* Mailbox.toStream(responseMailbox).pipe(
      Stream.map(JSON.stringify),
      Stream.pipeThroughChannel(HttpServerRequest.upgradeChannel()),
      Stream.decodeText(),
      Stream.runForEach((message) =>
        Effect.gen(function* () {
          const json = Messages.deserialize(message);
          const request = yield* decodeRequestMessage(json);
          switch (request.type) {
            case 'list-spaces': {
              const spaces = yield* spacesService.listByAppIdentity(address);
              const outgoingMessage: Messages.ResponseListSpaces = { type: 'list-spaces', spaces: spaces };
              // TODO: fix Messages.serialize
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));
              break;
            }
            case 'list-invitations': {
              const invitations = yield* invitationsService.listByAppIdentity(accountAddress);
              const outgoingMessage: Messages.ResponseListInvitations = {
                type: 'list-invitations',
                invitations,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));
              break;
            }
            case 'subscribe-space': {
              const space = yield* spacesService.getSpace({
                spaceId: request.id,
                accountAddress,
                appIdentityAddress: address,
              });

              // Track this subscription
              yield* connectionsService.subscribeToSpace(connectionId, request.id);

              const outgoingMessage: Messages.ResponseSpace = {
                type: 'space',
                ...space,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));
              break;
            }
            case 'create-update': {
              const signer = Messages.recoverUpdateMessageSigner(request);
              const identity = yield* identityService.getAppOrConnectIdentity({
                accountAddress: request.accountAddress,
                signaturePublicKey: signer,
              });
              if (identity.accountAddress !== accountAddress) {
                // TODO: improve error handling
                return yield* Effect.die(new Error('Invalid signature'));
              }

              const update = yield* updatesService.createUpdate({
                accountAddress: request.accountAddress,
                update: request.update,
                spaceId: request.spaceId,
                signatureHex: request.signature.hex,
                signatureRecovery: request.signature.recovery,
                updateId: request.updateId,
              });
              const outgoingMessage: Messages.ResponseUpdateConfirmed = {
                type: 'update-confirmed',
                updateId: request.updateId,
                clock: update.clock,
                spaceId: request.spaceId,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));

              // Broadcast the update to all subscribed clients
              const updates: Messages.Updates = {
                updates: [
                  {
                    update: update.content,
                    accountAddress: update.accountAddress,
                    signature: { hex: update.signatureHex, recovery: update.signatureRecovery },
                    updateId: update.updateId,
                  },
                ],
                firstUpdateClock: update.clock,
                lastUpdateClock: update.clock,
              };

              const broadcastMessage: Messages.ResponseUpdatesNotification = {
                type: 'updates-notification',
                updates,
                spaceId: request.spaceId,
              };

              yield* connectionsService.broadcastToSpace({
                spaceId: request.spaceId,
                message: broadcastMessage,
                excludeConnectionId: connectionId,
              });

              break;
            }
          }
        }),
      ),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          // Only log error if it's not a SocketCloseError
          if (!Socket.SocketCloseError.is(error)) {
            yield* Effect.logInfo('WebSocket disconnected due to error', {
              error: error.message || String(error),
              accountAddress,
              appIdentityAddress: address,
            });
          }
        }),
      ),
      Effect.ensuring(
        Effect.gen(function* () {
          // Clean up the connection when it closes
          yield* connectionsService.removeConnection(connectionId);
          yield* Effect.logInfo('WebSocket connection closed', {
            accountAddress,
            appIdentityAddress: address,
          });
        }),
      ),
      Effect.as(HttpServerResponse.empty()),
    );
  })
    .pipe(Effect.provide(AppIdentityService.layer))
    .pipe(Effect.provide(SpacesService.layer))
    .pipe(Effect.provide(InvitationsService.layer))
    .pipe(Effect.provide(IdentityService.layer))
    .pipe(Effect.provide(UpdatesService.layer)),
);

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
