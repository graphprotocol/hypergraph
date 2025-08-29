import { HttpApiBuilder } from '@effect/platform';
import { Messages, Utils } from '@graphprotocol/hypergraph';
import { Effect, Layer } from 'effect';
import { AppIdentityService } from '../services/app-identity.js';
import { ConnectIdentityService } from '../services/connect-identity.js';
import { PrivyAuthService } from '../services/privy-auth.js';
import { SpacesService } from '../services/spaces.js';
import * as Api from './api.js';
import * as Errors from './errors.js';

/**
 * Health Group Handlers
 */
const HealthGroupLive = HttpApiBuilder.group(Api.hypergraphApi, 'Health', (handlers) => {
  return handlers.handle('status', () => Effect.succeed('OK'));
});

/**
 * Connect Group Handlers
 */
const ConnectGroupLive = HttpApiBuilder.group(Api.hypergraphApi, 'Connect', (handlers) => {
  return handlers
    .handle(
      'getConnectSpaces',
      Effect.fn(function* ({ headers }) {
        yield* Effect.logInfo('GET /connect/spaces');

        const privyAuthService = yield* PrivyAuthService;
        const spacesService = yield* SpacesService;

        yield* privyAuthService.authenticateRequest(headers['privy-id-token'], headers['account-address']);

        const spaces = yield* spacesService.listByAccount(headers['account-address']);

        return { spaces };
      }),
    )
    .handle(
      'postConnectSpaces',
      Effect.fn(function* ({ headers, payload }) {
        yield* Effect.logInfo('POST /connect/spaces');

        const privyAuthService = yield* PrivyAuthService;
        const spacesService = yield* SpacesService;

        // Authenticate the request with Privy token
        yield* privyAuthService.authenticateRequest(headers['privy-id-token'], payload.accountAddress);

        // Create the space
        const space = yield* spacesService.createSpace({
          accountAddress: payload.accountAddress,
          event: payload.event,
          keyBox: payload.keyBox,
          infoContent: Utils.hexToBytes(payload.infoContent),
          infoSignatureHex: payload.infoSignature.hex,
          infoSignatureRecovery: payload.infoSignature.recovery,
          name: payload.name,
        });

        return { space };
      }),
    )
    .handle(
      'postConnectAddAppIdentityToSpaces',
      Effect.fn(function* ({ headers, payload }) {
        yield* Effect.logInfo('POST /connect/add-app-identity-to-spaces');

        const privyAuthService = yield* PrivyAuthService;
        const spacesService = yield* SpacesService;

        // Authenticate the request with Privy token
        yield* privyAuthService.authenticateRequest(headers['privy-id-token'], payload.accountAddress);

        // Add app identity to spaces
        yield* spacesService.addAppIdentityToSpaces({
          appIdentityAddress: payload.appIdentityAddress,
          accountAddress: payload.accountAddress,
          spacesInput: payload.spacesInput,
        });
      }),
    )
    .handle(
      'postConnectIdentity',
      Effect.fn(function* ({ payload }) {
        yield* Effect.logInfo('Creating connect identity', payload);
        yield* new Errors.ResourceNotFoundError({ resource: 'postConnectIdentity', id: 'postConnectIdentity' });
      }),
    )
    .handle(
      'getConnectIdentityEncrypted',
      Effect.fn(function* ({ request }) {
        yield* Effect.logInfo('Getting encrypted identity');
        yield* new Errors.ResourceNotFoundError({
          resource: 'getConnectIdentityEncrypted',
          id: 'getConnectIdentityEncrypted',
        });
      }),
    )
    .handle(
      'getConnectAppIdentity',
      Effect.fn(function* ({ path: { appId } }) {
        yield* Effect.logInfo(`Getting app identity for appId: ${appId}`);
        yield* new Errors.ResourceNotFoundError({ resource: 'getConnectAppIdentity', id: 'getConnectAppIdentity' });
      }),
    )
    .handle(
      'postConnectAppIdentity',
      Effect.fn(function* ({ payload }) {
        yield* Effect.logInfo('Creating app identity', payload);
        yield* new Errors.ResourceNotFoundError({ resource: 'postConnectAppIdentity', id: 'postConnectAppIdentity' });
      }),
    );
});

/**
 * Identity Group Handlers
 */
const IdentityGroupLive = HttpApiBuilder.group(Api.hypergraphApi, 'Identity', (handlers) => {
  return handlers
    .handle(
      'getWhoami',
      Effect.fn(function* ({ headers }) {
        yield* Effect.logInfo('GET /whoami');

        const authHeader = headers.authorization;
        const sessionToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        if (!sessionToken) {
          yield* new Errors.AuthenticationError({ message: 'No session token provided' });
        }

        const appIdentityService = yield* AppIdentityService;
        const { accountAddress } = yield* appIdentityService.getBySessionToken(sessionToken);

        return accountAddress;
      }),
    )
    .handle(
      'getConnectIdentity',
      Effect.fn(function* ({ urlParams }) {
        yield* Effect.logInfo('GET /connect/identity', { accountAddress: urlParams.accountAddress });

        if (!urlParams.accountAddress) {
          yield* new Errors.ValidationError({
            field: 'accountAddress',
            message: 'accountAddress is required',
          });
        }

        const connectIdentityService = yield* ConnectIdentityService;
        const identity = yield* connectIdentityService.getByAccountAddress(urlParams.accountAddress);

        const response: Messages.ResponseIdentity = {
          accountAddress: identity.accountAddress,
          signaturePublicKey: identity.signaturePublicKey,
          encryptionPublicKey: identity.encryptionPublicKey,
          accountProof: identity.accountProof,
          keyProof: identity.keyProof,
        };

        return response;
      }),
    )
    .handle(
      'getIdentity',
      Effect.fn(function* ({ urlParams }) {
        yield* Effect.logInfo('Getting identity', urlParams);
        yield* new Errors.ResourceNotFoundError({ resource: 'Identity', id: 'general' });
      }),
    );
});

/**
 * Inbox Group Handlers
 */
const InboxGroupLive = HttpApiBuilder.group(Api.hypergraphApi, 'Inbox', (handlers) => {
  return handlers
    .handle(
      'getSpaceInboxes',
      Effect.fn(function* ({ path: { spaceId } }) {
        yield* Effect.logInfo(`Getting space inboxes: ${spaceId}`);
        yield* new Errors.ResourceNotFoundError({
          resource: 'getSpaceInboxes',
          id: 'getSpaceInboxes',
        });
      }),
    )
    .handle(
      'getSpaceInbox',
      Effect.fn(function* ({ path: { spaceId, inboxId } }) {
        yield* Effect.logInfo(`Getting space inbox: ${spaceId}/${inboxId}`);
        yield* new Errors.ResourceNotFoundError({ resource: 'SpaceInbox', id: inboxId });
      }),
    )
    .handle(
      'postSpaceInboxMessage',
      Effect.fn(function* ({ path: { spaceId, inboxId }, payload }) {
        yield* Effect.logInfo(`Posting message to space inbox: ${spaceId}/${inboxId}`, payload);
        return { success: true };
      }),
    )
    .handle(
      'getAccountInboxes',
      Effect.fn(function* ({ path: { accountAddress } }) {
        yield* Effect.logInfo(`Getting account inboxes: ${accountAddress}`);
        yield* new Errors.ResourceNotFoundError({
          resource: 'getAccountInboxes',
          id: 'getAccountInboxes',
        });
      }),
    )
    .handle(
      'getAccountInbox',
      Effect.fn(function* ({ path: { accountAddress, inboxId } }) {
        yield* Effect.logInfo(`Getting account inbox: ${accountAddress}/${inboxId}`);
        yield* new Errors.ResourceNotFoundError({ resource: 'AccountInbox', id: inboxId });
      }),
    )
    .handle(
      'postAccountInboxMessage',
      Effect.fn(function* ({ path: { accountAddress, inboxId }, payload }) {
        yield* Effect.logInfo(`Posting message to account inbox: ${accountAddress}/${inboxId}`, payload);
        return { success: true };
      }),
    );
});

/**
 * All handlers combined
 */
export const HandlersLive = Layer.mergeAll(HealthGroupLive, ConnectGroupLive, IdentityGroupLive, InboxGroupLive);
