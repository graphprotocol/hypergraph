import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from '@effect/platform';
import { Messages } from '@graphprotocol/hypergraph';
import { Schema } from 'effect';
import * as Models from '../domain/models.js';
import * as Errors from './errors.js';

/**
 * Path Parameters
 */
export const appId = HttpApiSchema.param('appId', Schema.String);
export const spaceId = HttpApiSchema.param('spaceId', Schema.String);
export const inboxId = HttpApiSchema.param('inboxId', Schema.String);
export const accountAddress = HttpApiSchema.param('accountAddress', Schema.String);

/**
 * API Request/Response Schemas
 */
export class AppIdentityInfo extends Schema.Class<AppIdentityInfo>('AppIdentityInfo')({
  appId: Schema.String,
  address: Schema.String,
}) {}

export class SpaceKeyBoxInfo extends Schema.Class<SpaceKeyBoxInfo>('SpaceKeyBoxInfo')({
  id: Schema.String,
  ciphertext: Schema.String,
  nonce: Schema.String,
  authorPublicKey: Schema.String,
}) {}

export class SpaceInfo extends Schema.Class<SpaceInfo>('SpaceInfo')({
  id: Schema.String,
  infoContent: Schema.String,
  infoAuthorAddress: Schema.String,
  infoSignatureHex: Schema.String,
  infoSignatureRecovery: Schema.Number,
  name: Schema.String,
  appIdentities: Schema.Array(AppIdentityInfo),
  keyBoxes: Schema.Array(SpaceKeyBoxInfo),
}) {}

export class ConnectSpacesResponse extends Schema.Class<ConnectSpacesResponse>('ConnectSpacesResponse')({
  spaces: Schema.Array(SpaceInfo),
}) {}

export class SpaceCreationResponse extends Schema.Class<SpaceCreationResponse>('SpaceCreationResponse')({
  space: Schema.Struct({
    id: Schema.String,
  }),
}) {}

export class AppIdentityResponse extends Schema.Class<AppIdentityResponse>('AppIdentityResponse')({
  appIdentity: Models.AppIdentity,
}) {}

export class ConnectIdentityQuery extends Schema.Class<ConnectIdentityQuery>('ConnectIdentityQuery')({
  accountAddress: Schema.String,
}) {}

export class IdentityQuery extends Schema.Class<IdentityQuery>('IdentityQuery')({
  accountAddress: Schema.String,
  signaturePublicKey: Schema.optional(Schema.String),
  appId: Schema.optional(Schema.String),
}) {}

/**
 * Health endpoints
 */
export const statusEndpoint = HttpApiEndpoint.get('status')`/status`.addSuccess(Schema.String);

export const healthGroup = HttpApiGroup.make('Health').add(statusEndpoint);

/**
 * Connect API endpoints (Privy authentication)
 */
export const getConnectSpacesEndpoint = HttpApiEndpoint.get('getConnectSpaces')`/connect/spaces`
  .setHeaders(
    Schema.Struct({
      'privy-id-token': Schema.String,
      'account-address': Schema.String,
    }),
  )
  .addSuccess(ConnectSpacesResponse)
  .addError(Errors.AuthenticationError, { status: 401 })
  .addError(Errors.AuthorizationError, { status: 401 })
  .addError(Errors.PrivyTokenError, { status: 401 })
  .addError(Errors.InternalServerError);

export const postConnectSpacesEndpoint = HttpApiEndpoint.post('postConnectSpaces')`/connect/spaces`
  .setHeaders(
    Schema.Struct({
      'privy-id-token': Schema.String,
    }),
  )
  .setPayload(Messages.RequestConnectCreateSpaceEvent)
  .addSuccess(SpaceCreationResponse)
  .addError(Errors.AuthenticationError, { status: 401 })
  .addError(Errors.AuthorizationError, { status: 401 })
  .addError(Errors.ValidationError, { status: 400 })
  .addError(Errors.PrivyTokenError, { status: 401 })
  .addError(Errors.InternalServerError);

export const postConnectAddAppIdentityToSpacesEndpoint = HttpApiEndpoint.post(
  'postConnectAddAppIdentityToSpaces',
)`/connect/add-app-identity-to-spaces`
  .setHeaders(
    Schema.Struct({
      'privy-id-token': Schema.String,
    }),
  )
  .setPayload(Messages.RequestConnectAddAppIdentityToSpaces)
  .addSuccess(Schema.Void, { status: 200 })
  .addError(Errors.AuthenticationError, { status: 401 })
  .addError(Errors.AuthorizationError, { status: 401 })
  .addError(Errors.ValidationError, { status: 400 })
  .addError(Errors.PrivyTokenError, { status: 401 })
  .addError(Errors.InternalServerError);

export const postConnectIdentityEndpoint = HttpApiEndpoint.post('postConnectIdentity')`/connect/identity`
  .setHeaders(
    Schema.Struct({
      'privy-id-token': Schema.String,
    }),
  )
  .setPayload(Messages.RequestConnectCreateIdentity)
  .addSuccess(Messages.ResponseConnectCreateIdentity)
  .addError(Errors.AuthenticationError, { status: 401 })
  .addError(Errors.AuthorizationError, { status: 401 })
  .addError(Errors.ResourceAlreadyExistsError, { status: 400 })
  .addError(Errors.OwnershipProofError, { status: 401 })
  .addError(Errors.PrivyTokenError, { status: 401 })
  .addError(Errors.InternalServerError);

export const getConnectIdentityEncryptedEndpoint = HttpApiEndpoint.get(
  'getConnectIdentityEncrypted',
)`/connect/identity/encrypted`
  .setHeaders(
    Schema.Struct({
      'privy-id-token': Schema.String,
      'account-address': Schema.String,
    }),
  )
  .addSuccess(Messages.ResponseIdentityEncrypted)
  .addError(Errors.AuthenticationError, { status: 401 })
  .addError(Errors.AuthorizationError, { status: 401 })
  .addError(Errors.ResourceNotFoundError, { status: 404 })
  .addError(Errors.PrivyTokenError, { status: 401 })
  .addError(Errors.InternalServerError);

export const getConnectAppIdentityEndpoint = HttpApiEndpoint.get(
  'getConnectAppIdentity',
)`/connect/app-identity/${appId}`
  .setHeaders(
    Schema.Struct({
      'privy-id-token': Schema.String,
      'account-address': Schema.String,
    }),
  )
  .addSuccess(AppIdentityResponse)
  .addError(Errors.AuthenticationError, { status: 401 })
  .addError(Errors.AuthorizationError, { status: 401 })
  .addError(Errors.ResourceNotFoundError, { status: 404 })
  .addError(Errors.PrivyTokenError, { status: 401 })
  .addError(Errors.InternalServerError);

export const postConnectAppIdentityEndpoint = HttpApiEndpoint.post('postConnectAppIdentity')`/connect/app-identity`
  .setHeaders(
    Schema.Struct({
      'privy-id-token': Schema.String,
    }),
  )
  .setPayload(Messages.RequestConnectCreateAppIdentity)
  .addSuccess(AppIdentityResponse)
  .addError(Errors.AuthenticationError, { status: 401 })
  .addError(Errors.AuthorizationError, { status: 401 })
  .addError(Errors.ResourceAlreadyExistsError, { status: 400 })
  .addError(Errors.OwnershipProofError, { status: 401 })
  .addError(Errors.PrivyTokenError, { status: 401 })
  .addError(Errors.InternalServerError);

export const connectGroup = HttpApiGroup.make('Connect')
  .add(getConnectSpacesEndpoint)
  .add(postConnectSpacesEndpoint)
  .add(postConnectAddAppIdentityToSpacesEndpoint)
  .add(postConnectIdentityEndpoint)
  .add(getConnectIdentityEncryptedEndpoint)
  .add(getConnectAppIdentityEndpoint)
  .add(postConnectAppIdentityEndpoint);

/**
 * Identity endpoints
 */
export const getWhoamiEndpoint = HttpApiEndpoint.get('getWhoami')`/whoami`
  .setHeaders(Schema.Struct({ authorization: Schema.String }))
  .addSuccess(Schema.String)
  .addError(Errors.AuthenticationError, { status: 401 })
  .addError(Errors.InvalidTokenError, { status: 401 })
  .addError(Errors.TokenExpiredError, { status: 401 })
  .addError(Errors.ResourceNotFoundError, { status: 404 });

export const getConnectIdentityEndpoint = HttpApiEndpoint.get('getConnectIdentity')`/connect/identity`
  .setUrlParams(ConnectIdentityQuery)
  .addSuccess(Messages.ResponseIdentity)
  .addError(Errors.ValidationError, { status: 400 })
  .addError(Errors.ResourceNotFoundError, { status: 404 });

export const getIdentityEndpoint = HttpApiEndpoint.get('getIdentity')`/identity`
  .setUrlParams(IdentityQuery)
  .addSuccess(Messages.ResponseIdentity)
  .addError(Errors.ValidationError, { status: 400 })
  .addError(Errors.ResourceNotFoundError, { status: 404 });

export const identityGroup = HttpApiGroup.make('Identity')
  .add(getWhoamiEndpoint)
  .add(getConnectIdentityEndpoint)
  .add(getIdentityEndpoint);

/**
 * Inbox endpoints
 */
export const getSpaceInboxesEndpoint = HttpApiEndpoint.get('getSpaceInboxes')`/spaces/${spaceId}/inboxes`
  .addSuccess(Messages.ResponseListSpaceInboxesPublic)
  .addError(Errors.InternalServerError);

export const getSpaceInboxEndpoint = HttpApiEndpoint.get('getSpaceInbox')`/spaces/${spaceId}/inboxes/${inboxId}`
  .addSuccess(Messages.ResponseSpaceInboxPublic)
  .addError(Errors.ResourceNotFoundError, { status: 404 })
  .addError(Errors.InternalServerError);

export const postSpaceInboxMessageEndpoint = HttpApiEndpoint.post(
  'postSpaceInboxMessage',
)`/spaces/${spaceId}/inboxes/${inboxId}/messages`
  .setPayload(Messages.RequestCreateSpaceInboxMessage)
  .addSuccess(Schema.Void, { status: 200 })
  .addError(Errors.ValidationError, { status: 400 })
  .addError(Errors.AuthorizationError, { status: 403 })
  .addError(Errors.ResourceNotFoundError, { status: 404 })
  .addError(Errors.InternalServerError);

export const getAccountInboxesEndpoint = HttpApiEndpoint.get('getAccountInboxes')`/accounts/${accountAddress}/inboxes`
  .addSuccess(Messages.ResponseListAccountInboxesPublic)
  .addError(Errors.InternalServerError);

export const getAccountInboxEndpoint = HttpApiEndpoint.get(
  'getAccountInbox',
)`/accounts/${accountAddress}/inboxes/${inboxId}`
  .addSuccess(Messages.ResponseAccountInboxPublic)
  .addError(Errors.ResourceNotFoundError, { status: 404 })
  .addError(Errors.InternalServerError);

export const postAccountInboxMessageEndpoint = HttpApiEndpoint.post(
  'postAccountInboxMessage',
)`/accounts/${accountAddress}/inboxes/${inboxId}/messages`
  .setPayload(Messages.RequestCreateAccountInboxMessage)
  .addSuccess(Schema.Void)
  .addError(Errors.ValidationError, { status: 400 })
  .addError(Errors.AuthorizationError, { status: 403 })
  .addError(Errors.ResourceNotFoundError, { status: 404 })
  .addError(Errors.InternalServerError);

export const inboxGroup = HttpApiGroup.make('Inbox')
  .add(getSpaceInboxesEndpoint)
  .add(getSpaceInboxEndpoint)
  .add(postSpaceInboxMessageEndpoint)
  .add(getAccountInboxesEndpoint)
  .add(getAccountInboxEndpoint)
  .add(postAccountInboxMessageEndpoint);

/**
 * Main API definition
 */
export const hypergraphApi = HttpApi.make('HypergraphApi')
  .add(healthGroup)
  .add(connectGroup)
  .add(identityGroup)
  .add(inboxGroup);
