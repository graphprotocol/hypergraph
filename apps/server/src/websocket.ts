import * as HttpLayerRouter from '@effect/platform/HttpLayerRouter';
import * as HttpServerRequest from '@effect/platform/HttpServerRequest';
import * as HttpServerResponse from '@effect/platform/HttpServerResponse';
import * as Socket from '@effect/platform/Socket';
import { Messages } from '@graphprotocol/hypergraph';
import { isArray } from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Mailbox from 'effect/Mailbox';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';
import * as AccountInboxService from './services/account-inbox.ts';
import * as AppIdentityService from './services/app-identity.ts';
import * as ConnectionsService from './services/connections.ts';
import * as IdentityService from './services/identity.ts';
import * as InvitationsService from './services/invitations.ts';
import * as PrivyAuthService from './services/privy-auth.ts';
import * as SpaceInboxService from './services/space-inbox.ts';
import * as SpacesService from './services/spaces.ts';
import * as UpdatesService from './services/updates.ts';

const decodeRequestMessage = Schema.decodeUnknownEither(Messages.RequestMessage);

export const WebSocketLayer = HttpLayerRouter.add(
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
    const appIdentityService = yield* AppIdentityService.AppIdentityService;
    const identityService = yield* IdentityService.IdentityService;
    const privyAuthService = yield* PrivyAuthService.PrivyAuthService;
    const responseMailbox = yield* Mailbox.make<Messages.ResponseMessage>();

    const searchParams = HttpServerRequest.searchParamsFromURL(new URL(request.url, 'http://localhost'));
    const token = isArray(searchParams.token) ? searchParams.token[0] : searchParams.token;
    const privyIdentityToken = isArray(searchParams['privy-identity-token'])
      ? searchParams['privy-identity-token'][0]
      : searchParams['privy-identity-token'];
    const privyAccountAddress = isArray(searchParams['account-address'])
      ? searchParams['account-address'][0]
      : searchParams['account-address'];

    if (!token && (!privyIdentityToken || !privyAccountAddress)) {
      return yield* HttpServerResponse.empty({ status: 400 });
    }

    let accountAddress: string;
    let address: string | undefined;
    if (privyIdentityToken && privyAccountAddress) {
      yield* privyAuthService.authenticateRequest(privyIdentityToken, privyAccountAddress).pipe(Effect.orDie);
      accountAddress = privyAccountAddress;
    } else {
      const result = yield* appIdentityService.getBySessionToken(token).pipe(Effect.orDie);
      accountAddress = result.accountAddress;
      address = result.address;
    }

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
              const spaces = yield* spacesService.listByAppIdentityOrAccount({
                appIdentityAddress: address,
                accountAddress,
              });
              const outgoingMessage: Messages.ResponseListSpaces = { type: 'list-spaces', spaces: spaces };
              // TODO: fix Messages.serialize
              yield* responseMailbox.offer(Messages.serializeV2(outgoingMessage));
              break;
            }
            case 'list-invitations': {
              const invitations = yield* invitationsService.listByAccountAddress(accountAddress);
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

              // Notify the invitee if they're connected
              if (request.event.transaction.type === 'create-invitation') {
                const inviteeAccountAddress = request.event.transaction.inviteeAccountAddress;

                // Get the updated invitation list for the invitee
                const invitations = yield* invitationsService.listByAccountAddress(inviteeAccountAddress);
                const invitationMessage: Messages.ResponseListInvitations = {
                  type: 'list-invitations',
                  invitations,
                };

                // Broadcast to all connections for the invitee account
                yield* connectionsService.broadcastToAccount({
                  accountAddress: inviteeAccountAddress,
                  message: invitationMessage,
                });
              }

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

              // Send the updated space back to the client
              const outgoingMessage: Messages.ResponseInvitationAccepted = {
                type: 'invitation-accepted',
                invitationId: request.event.transaction.id,
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

              yield* responseMailbox.offer(Messages.serializeV2(inboxMessage));

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
    .pipe(Effect.provide(SpaceInboxService.layer))
    .pipe(Effect.provide(PrivyAuthService.layer)),
);
