import { HttpApiBuilder } from '@effect/platform';
import { Identity, type Messages, Utils } from '@graphprotocol/hypergraph';
import { bytesToHex, randomBytes } from '@noble/hashes/utils.js';
import { Effect, Layer } from 'effect';
import { hypergraphChainConfig, hypergraphRpcUrlConfig } from '../config/hypergraph.js';
import * as AccountInboxService from '../services/account-inbox.js';
import * as AppIdentityService from '../services/app-identity.js';
import * as ConnectIdentityService from '../services/connect-identity.js';
import * as IdentityService from '../services/identity.js';
import * as PrivyAuthService from '../services/privy-auth.js';
import * as SpaceInboxService from '../services/space-inbox.js';
import * as SpacesService from '../services/spaces.js';
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
      Effect.fn('getConnectSpaces')(function* ({ headers }) {
        yield* Effect.logInfo('GET /connect/spaces');

        const privyAuthService = yield* PrivyAuthService.PrivyAuthService;
        const spacesService = yield* SpacesService.SpacesService;

        yield* privyAuthService
          .authenticateRequest(headers['privy-id-token'], headers['account-address'])
          .pipe(Effect.orDie);
        const spaces = yield* spacesService.listByAccount(headers['account-address']).pipe(Effect.orDie);

        return { spaces };
      }),
    )
    .handle(
      'postConnectSpaces',
      Effect.fn('postConnectSpaces')(function* ({ headers, payload }) {
        yield* Effect.logInfo('POST /connect/spaces');

        const privyAuthService = yield* PrivyAuthService.PrivyAuthService;
        const spacesService = yield* SpacesService.SpacesService;

        // Authenticate the request with Privy token
        yield* privyAuthService
          .authenticateRequest(headers['privy-id-token'], payload.accountAddress)
          .pipe(Effect.orDie);

        // Create the space
        const space = yield* spacesService
          .createSpace({
            accountAddress: payload.accountAddress,
            event: payload.event,
            keyBox: payload.keyBox,
            infoContent: Utils.hexToBytes(payload.infoContent),
            infoSignatureHex: payload.infoSignature.hex,
            infoSignatureRecovery: payload.infoSignature.recovery,
            name: payload.name,
          })
          .pipe(Effect.orDie);

        return { space };
      }),
    )
    .handle(
      'postConnectAddAppIdentityToSpaces',
      Effect.fn('postConnectAddAppIdentityToSpaces')(function* ({ headers, payload }) {
        yield* Effect.logInfo('POST /connect/add-app-identity-to-spaces');

        const privyAuthService = yield* PrivyAuthService.PrivyAuthService;
        const spacesService = yield* SpacesService.SpacesService;

        // Authenticate the request with Privy token
        yield* privyAuthService
          .authenticateRequest(headers['privy-id-token'], payload.accountAddress)
          .pipe(Effect.orDie);

        // Add app identity to spaces
        yield* spacesService
          .addAppIdentityToSpaces({
            appIdentityAddress: payload.appIdentityAddress,
            accountAddress: payload.accountAddress,
            spacesInput: payload.spacesInput,
          })
          .pipe(Effect.orDie);
      }),
    )
    .handle(
      'postConnectIdentity',
      Effect.fn('postConnectIdentity')(function* ({ headers, payload }) {
        yield* Effect.logInfo('POST /connect/identity');

        const privyAuthService = yield* PrivyAuthService.PrivyAuthService;
        const connectIdentityService = yield* ConnectIdentityService.ConnectIdentityService;
        const chain = yield* hypergraphChainConfig.pipe(Effect.orDie);
        const rpcUrl = yield* hypergraphRpcUrlConfig.pipe(Effect.orDie);

        // Verify the Privy token and get signer address
        const signerAddress = yield* privyAuthService.verifyPrivyToken(headers['privy-id-token']).pipe(Effect.orDie);
        const accountAddress = payload.keyBox.accountAddress;

        // Verify that the signer matches the one in the keyBox
        if (signerAddress !== payload.keyBox.signer) {
          return yield* new Errors.AuthorizationError({
            message: 'Signer mismatch',
            accountAddress,
          });
        }

        // Verify identity ownership proof
        const isValid = yield* Effect.tryPromise({
          try: () =>
            Identity.verifyIdentityOwnership(
              accountAddress,
              payload.signaturePublicKey,
              payload.accountProof,
              payload.keyProof,
              chain,
              rpcUrl,
            ),
          catch: () =>
            new Errors.OwnershipProofError({
              accountAddress,
              reason: 'Failed to verify identity ownership',
            }),
        });

        if (!isValid) {
          return yield* new Errors.OwnershipProofError({
            accountAddress,
            reason: 'Invalid ownership proof',
          });
        }

        yield* Effect.logInfo('Ownership proof is valid');

        // Create the identity
        yield* connectIdentityService
          .createIdentity({
            signerAddress,
            accountAddress,
            ciphertext: payload.keyBox.ciphertext,
            nonce: payload.keyBox.nonce,
            signaturePublicKey: payload.signaturePublicKey,
            encryptionPublicKey: payload.encryptionPublicKey,
            accountProof: payload.accountProof,
            keyProof: payload.keyProof,
          })
          .pipe(Effect.orDie);

        const response: Messages.ResponseConnectCreateIdentity = {
          success: true,
        };

        return response;
      }),
    )
    .handle(
      'getConnectIdentityEncrypted',
      Effect.fn('getConnectIdentityEncrypted')(function* ({ headers }) {
        yield* Effect.logInfo('GET /connect/identity/encrypted');

        const privyAuthService = yield* PrivyAuthService.PrivyAuthService;
        const connectIdentityService = yield* ConnectIdentityService.ConnectIdentityService;

        // Authenticate the request with Privy token
        const signerAddress = yield* privyAuthService.verifyPrivyToken(headers['privy-id-token']).pipe(Effect.orDie);
        const accountAddress = headers['account-address'];

        // Verify the signer is authorized for this account
        yield* privyAuthService.isSignerForAccount(signerAddress, accountAddress).pipe(Effect.orDie);

        // Get the encrypted identity
        const identity = yield* connectIdentityService.getIdentityEncrypted(accountAddress).pipe(Effect.orDie);

        const response: Messages.ResponseIdentityEncrypted = {
          keyBox: {
            accountAddress,
            ciphertext: identity.ciphertext,
            nonce: identity.nonce,
            signer: signerAddress,
          },
        };

        return response;
      }),
    )
    .handle(
      'getConnectAppIdentity',
      Effect.fn('getConnectAppIdentity')(function* ({ headers, path: { appId } }) {
        yield* Effect.logInfo(`GET /connect/app-identity/${appId}`);

        const privyAuthService = yield* PrivyAuthService.PrivyAuthService;
        const appIdentityService = yield* AppIdentityService.AppIdentityService;

        // Authenticate the request with Privy token
        yield* privyAuthService
          .authenticateRequest(headers['privy-id-token'], headers['account-address'])
          .pipe(Effect.orDie);

        // Find the app identity
        const appIdentity = yield* appIdentityService
          .findByAppId({
            accountAddress: headers['account-address'],
            appId,
          })
          .pipe(Effect.orDie);

        if (!appIdentity) {
          return yield* new Errors.ResourceNotFoundError({
            resource: 'AppIdentity',
            id: appId,
          });
        }

        return { appIdentity };
      }),
    )
    .handle(
      'postConnectAppIdentity',
      Effect.fn('postConnectAppIdentity')(function* ({ headers, payload }) {
        yield* Effect.logInfo('POST /connect/app-identity');

        const privyAuthService = yield* PrivyAuthService.PrivyAuthService;
        const appIdentityService = yield* AppIdentityService.AppIdentityService;
        const chain = yield* hypergraphChainConfig.pipe(Effect.orDie);
        const rpcUrl = yield* hypergraphRpcUrlConfig.pipe(Effect.orDie);

        // Verify the Privy token and get signer address
        const signerAddress = yield* privyAuthService.verifyPrivyToken(headers['privy-id-token']).pipe(Effect.orDie);
        const accountAddress = payload.accountAddress;

        // Verify signer is authorized for this account
        yield* privyAuthService.isSignerForAccount(signerAddress, accountAddress).pipe(Effect.orDie);

        // Verify identity ownership proof
        const isValid = yield* Effect.tryPromise({
          try: () =>
            Identity.verifyIdentityOwnership(
              accountAddress,
              payload.signaturePublicKey,
              payload.accountProof,
              payload.keyProof,
              chain,
              rpcUrl,
            ),
          catch: () =>
            new Errors.OwnershipProofError({
              accountAddress,
              reason: 'Failed to verify identity ownership',
            }),
        }).pipe(Effect.orDie);

        if (!isValid) {
          return yield* new Errors.OwnershipProofError({
            accountAddress,
            reason: 'Invalid ownership proof',
          });
        }

        // Generate session token
        const sessionToken = bytesToHex(randomBytes(32));
        const sessionTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

        // Create the app identity
        yield* appIdentityService
          .createAppIdentity({
            accountAddress,
            appId: payload.appId,
            address: payload.address,
            ciphertext: payload.ciphertext,
            signaturePublicKey: payload.signaturePublicKey,
            encryptionPublicKey: payload.encryptionPublicKey,
            accountProof: payload.accountProof,
            keyProof: payload.keyProof,
            sessionToken,
            sessionTokenExpires,
          })
          .pipe(Effect.orDie);
      }),
    );
}).pipe(
  Layer.provide(PrivyAuthService.layer),
  Layer.provide(AppIdentityService.layer),
  Layer.provide(ConnectIdentityService.layer),
  Layer.provide(SpacesService.layer),
);

/**
 * Identity Group Handlers
 */
const IdentityGroupLive = HttpApiBuilder.group(Api.hypergraphApi, 'Identity', (handlers) => {
  return handlers
    .handle(
      'getWhoami',
      Effect.fn('getWhoami')(function* ({ headers }) {
        yield* Effect.logInfo('GET /whoami');

        const authHeader = headers.authorization;
        const sessionToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        if (!sessionToken) {
          return yield* new Errors.AuthenticationError({ message: 'No session token provided' });
        }

        const appIdentityService = yield* AppIdentityService.AppIdentityService;
        const { accountAddress } = yield* appIdentityService.getBySessionToken(sessionToken).pipe(Effect.orDie);

        return accountAddress;
      }),
    )
    .handle(
      'getConnectIdentity',
      Effect.fn('getConnectIdentity')(function* ({ urlParams }) {
        yield* Effect.logInfo('GET /connect/identity', { accountAddress: urlParams.accountAddress });

        if (!urlParams.accountAddress) {
          return yield* new Errors.ValidationError({
            field: 'accountAddress',
            message: 'accountAddress is required',
          });
        }

        const connectIdentityService = yield* ConnectIdentityService.ConnectIdentityService;
        const identity = yield* connectIdentityService.getByAccountAddress(urlParams.accountAddress).pipe(Effect.orDie);

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
      Effect.fn('getIdentity')(function* ({ urlParams }) {
        yield* Effect.logInfo('GET /identity', urlParams);

        const identityService = yield* IdentityService.IdentityService;

        // Validate required parameters
        if (!urlParams.accountAddress) {
          return yield* new Errors.ValidationError({
            field: 'accountAddress',
            message: 'accountAddress is required',
          });
        }

        if (!urlParams.signaturePublicKey && !urlParams.appId) {
          return yield* new Errors.ValidationError({
            field: 'signaturePublicKey or appId',
            message: 'Either signaturePublicKey or appId is required',
          });
        }

        // Build params based on what's provided
        const params = urlParams.signaturePublicKey
          ? { accountAddress: urlParams.accountAddress, signaturePublicKey: urlParams.signaturePublicKey }
          : { accountAddress: urlParams.accountAddress, appId: urlParams.appId as string };

        const identity = yield* identityService.getAppOrConnectIdentity(params).pipe(Effect.orDie);

        const response: Messages.ResponseIdentity = {
          accountAddress: urlParams.accountAddress,
          signaturePublicKey: identity.signaturePublicKey,
          encryptionPublicKey: identity.encryptionPublicKey,
          accountProof: identity.accountProof,
          keyProof: identity.keyProof,
          appId: identity.appId ?? undefined,
        };

        return response;
      }),
    );
}).pipe(
  Layer.provide(AppIdentityService.layer),
  Layer.provide(ConnectIdentityService.layer),
  Layer.provide(IdentityService.layer),
);

/**
 * Inbox Group Handlers
 */
const InboxGroupLive = HttpApiBuilder.group(Api.hypergraphApi, 'Inbox', (handlers) => {
  return handlers
    .handle(
      'getSpaceInboxes',
      Effect.fn('getSpaceInboxes')(function* ({ path: { spaceId } }) {
        yield* Effect.logInfo(`GET /spaces/${spaceId}/inboxes`);

        const spaceInboxService = yield* SpaceInboxService.SpaceInboxService;

        const inboxes = yield* spaceInboxService.listPublicSpaceInboxes({ spaceId }).pipe(Effect.orDie);

        return { inboxes };
      }),
    )
    .handle(
      'getSpaceInbox',
      Effect.fn('getSpaceInbox')(function* ({ path: { spaceId, inboxId } }) {
        yield* Effect.logInfo(`GET /spaces/${spaceId}/inboxes/${inboxId}`);

        const spaceInboxService = yield* SpaceInboxService.SpaceInboxService;

        const inbox = yield* spaceInboxService.getSpaceInbox({ spaceId, inboxId }).pipe(Effect.orDie);

        return { inbox };
      }),
    )
    .handle(
      'postSpaceInboxMessage',
      Effect.fn('postSpaceInboxMessage')(function* ({ path: { spaceId, inboxId }, payload }) {
        yield* Effect.logInfo(`POST /spaces/${spaceId}/inboxes/${inboxId}/messages`);

        const spaceInboxService = yield* SpaceInboxService.SpaceInboxService;

        yield* spaceInboxService
          .postSpaceInboxMessage({
            spaceId,
            inboxId,
            message: payload,
          })
          .pipe(Effect.orDie);

        // Return void as per the API endpoint definition
      }),
    )
    .handle(
      'getAccountInboxes',
      Effect.fn('getAccountInboxes')(function* ({ path: { accountAddress } }) {
        yield* Effect.logInfo(`GET /accounts/${accountAddress}/inboxes`);

        const accountInboxService = yield* AccountInboxService.AccountInboxService;

        const inboxes = yield* accountInboxService.listPublicAccountInboxes({ accountAddress }).pipe(Effect.orDie);

        return { inboxes };
      }),
    )
    .handle(
      'getAccountInbox',
      Effect.fn('getAccountInbox')(function* ({ path: { accountAddress, inboxId } }) {
        yield* Effect.logInfo(`GET /accounts/${accountAddress}/inboxes/${inboxId}`);

        const accountInboxService = yield* AccountInboxService.AccountInboxService;

        const inbox = yield* accountInboxService.getAccountInbox({ accountAddress, inboxId }).pipe(Effect.orDie);

        return { inbox };
      }),
    )
    .handle(
      'postAccountInboxMessage',
      Effect.fn('postAccountInboxMessage')(function* ({ path: { accountAddress, inboxId }, payload }) {
        yield* Effect.logInfo(`POST /accounts/${accountAddress}/inboxes/${inboxId}/messages`);

        const accountInboxService = yield* AccountInboxService.AccountInboxService;

        yield* accountInboxService
          .postAccountInboxMessage({
            accountAddress,
            inboxId,
            message: payload,
          })
          .pipe(Effect.orDie);

        // Return void as per the API endpoint definition
      }),
    );
}).pipe(Layer.provide(AccountInboxService.layer), Layer.provide(SpaceInboxService.layer));

/**
 * All handlers combined
 */
export const HandlersLive = Layer.mergeAll(HealthGroupLive, ConnectGroupLive, IdentityGroupLive, InboxGroupLive);
