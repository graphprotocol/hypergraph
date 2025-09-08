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
import * as AccountInboxService from './services/account-inbox.ts';
import * as AppIdentityService from './services/app-identity.ts';
import * as ConnectionsService from './services/connections.ts';
import * as IdentityService from './services/identity.ts';
import * as InvitationsService from './services/invitations.ts';
import * as SpaceInboxService from './services/space-inbox.ts';
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
    const accountInboxService = yield* AccountInboxService.AccountInboxService;
    const spaceInboxService = yield* SpaceInboxService.SpaceInboxService;
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
            case 'create-space-event': {
              // Create the new space
              const spaceResult = yield* spacesService.createSpace({
                accountAddress,
                event: request.event,
                keyBox: request.keyBox,
                infoContent: new Uint8Array(), // TODO: Get from request when available
                infoSignatureHex: '',
                infoSignatureRecovery: 0,
                name: request.name,
              });

              // Get the full space data to send back
              const space = yield* spacesService.getSpace({
                spaceId: spaceResult.id,
                accountAddress,
                appIdentityAddress: address,
              });

              const outgoingMessage: Messages.ResponseSpace = {
                type: 'space',
                ...space,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));

              break;
            }
            case 'create-invitation-event': {
              // Apply the invitation event to the space
              yield* spacesService.applySpaceEvent({
                accountAddress,
                spaceId: request.spaceId,
                event: request.event,
                keyBoxes: [...request.keyBoxes], // Convert readonly array to mutable
              });

              // Get the updated space data
              const space = yield* spacesService.getSpace({
                spaceId: request.spaceId,
                accountAddress,
                appIdentityAddress: address,
              });

              // Send the updated space back to the client
              const outgoingMessage: Messages.ResponseSpace = {
                type: 'space',
                ...space,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));

              // Broadcast the space event to other subscribers
              const spaceEventMessage: Messages.ResponseSpaceEvent = {
                type: 'space-event',
                spaceId: request.spaceId,
                event: request.event,
              };

              yield* connectionsService.broadcastToSpace({
                spaceId: request.spaceId,
                message: spaceEventMessage,
                excludeConnectionId: connectionId,
              });

              // Note: Invitee notification would require adding a method to ConnectionsService
              // to find connections by account address and broadcast to them

              break;
            }
            case 'accept-invitation-event': {
              // Apply the invitation acceptance event to the space
              yield* spacesService.applySpaceEvent({
                accountAddress,
                spaceId: request.spaceId,
                event: request.event,
                keyBoxes: [], // No keyBoxes needed for accepting invitations
              });

              // Get the updated space data
              const space = yield* spacesService.getSpace({
                spaceId: request.spaceId,
                accountAddress,
                appIdentityAddress: address,
              });

              // Send the updated space back to the client
              const outgoingMessage: Messages.ResponseSpace = {
                type: 'space',
                ...space,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));

              // Broadcast the space event to other subscribers
              const spaceEventMessage: Messages.ResponseSpaceEvent = {
                type: 'space-event',
                spaceId: request.spaceId,
                event: request.event,
              };

              yield* connectionsService.broadcastToSpace({
                spaceId: request.spaceId,
                message: spaceEventMessage,
                excludeConnectionId: connectionId,
              });

              break;
            }
            case 'create-space-inbox-event': {
              // Apply the space inbox creation event to the space
              yield* spacesService.applySpaceEvent({
                accountAddress,
                spaceId: request.spaceId,
                event: request.event,
                keyBoxes: [], // No keyBoxes needed for creating space inboxes
              });

              // Get the updated space data
              const space = yield* spacesService.getSpace({
                spaceId: request.spaceId,
                accountAddress,
                appIdentityAddress: address,
              });

              // Send the updated space back to the client
              const outgoingMessage: Messages.ResponseSpace = {
                type: 'space',
                ...space,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));

              // Broadcast the space event to other subscribers
              const spaceEventMessage: Messages.ResponseSpaceEvent = {
                type: 'space-event',
                spaceId: request.spaceId,
                event: request.event,
              };

              yield* connectionsService.broadcastToSpace({
                spaceId: request.spaceId,
                message: spaceEventMessage,
                excludeConnectionId: connectionId,
              });

              break;
            }
            case 'create-account-inbox': {
              // Validate that the account matches the authenticated user
              if (request.accountAddress !== accountAddress) {
                // TODO: Better error handling
                return yield* Effect.fail(new Error('Invalid accountAddress'));
              }

              // Create the account inbox
              const inbox = yield* accountInboxService.createAccountInbox(request);

              // Broadcast the new inbox to other clients from the same account
              const inboxMessage: Messages.ResponseAccountInbox = {
                type: 'account-inbox',
                inbox: {
                  accountAddress: inbox.accountAddress,
                  inboxId: inbox.inboxId,
                  isPublic: inbox.isPublic,
                  authPolicy: inbox.authPolicy,
                  encryptionPublicKey: inbox.encryptionPublicKey,
                  signature: inbox.signature,
                },
              };

              yield* connectionsService.broadcastToAccount({
                accountAddress,
                message: inboxMessage,
                excludeConnectionId: connectionId,
              });

              break;
            }
            case 'get-latest-space-inbox-messages': {
              // Check that the user has access to this space
              yield* spacesService.getSpace({
                spaceId: request.spaceId,
                accountAddress,
                appIdentityAddress: address,
              });

              // Get the latest messages from the space inbox
              const messages = yield* spaceInboxService.getLatestSpaceInboxMessages({
                inboxId: request.inboxId,
                since: request.since,
              });

              const outgoingMessage: Messages.ResponseSpaceInboxMessages = {
                type: 'space-inbox-messages',
                spaceId: request.spaceId,
                inboxId: request.inboxId,
                messages,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));

              break;
            }
            case 'get-latest-account-inbox-messages': {
              // Check that the user has access to this inbox
              yield* accountInboxService.getAccountInbox({
                accountAddress,
                inboxId: request.inboxId,
              });

              // Get the latest messages from the account inbox
              const messages = yield* accountInboxService.getLatestAccountInboxMessages({
                inboxId: request.inboxId,
                since: request.since,
              });

              const outgoingMessage: Messages.ResponseAccountInboxMessages = {
                type: 'account-inbox-messages',
                accountAddress,
                inboxId: request.inboxId,
                messages,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));

              break;
            }
            case 'get-account-inboxes': {
              // List all inboxes for the authenticated account
              const inboxes = yield* accountInboxService.listAccountInboxes({ accountAddress });

              const outgoingMessage: Messages.ResponseAccountInboxes = {
                type: 'account-inboxes',
                inboxes,
              };
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));

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
    .pipe(Effect.provide(UpdatesService.layer))
    .pipe(Effect.provide(AccountInboxService.layer))
    .pipe(Effect.provide(SpaceInboxService.layer)),
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
