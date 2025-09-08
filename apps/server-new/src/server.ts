import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer';
import * as HttpApiScalar from '@effect/platform/HttpApiScalar';
import * as HttpLayerRouter from '@effect/platform/HttpLayerRouter';
import * as HttpMiddleware from '@effect/platform/HttpMiddleware';
import * as HttpServerRequest from '@effect/platform/HttpServerRequest';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import { Messages } from '@graphprotocol/hypergraph';
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
    const responseMailbox = yield* Mailbox.make<Messages.ResponseMessage>();

    const searchParams = HttpServerRequest.searchParamsFromURL(new URL(request.url, 'http://localhost'));
    const token = isArray(searchParams.token) ? searchParams.token[0] : searchParams.token;

    if (!token) {
      return yield* HttpServerResponse.empty({ status: 400 });
    }

    const appIdentityService = yield* AppIdentityService.AppIdentityService;
    const identityService = yield* IdentityService.IdentityService;
    const { accountAddress, address } = yield* appIdentityService.getBySessionToken(token).pipe(Effect.orDie);

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

              // TODO: broadcast updates
              break;
            }
          }
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

export const server = HttpLayerRouter.serve(AppLayer).pipe(Layer.provide(HttpServerLayer));
