import { Schema } from 'effect';

/**
 * Authentication-related errors
 */
export class AuthenticationError extends Schema.TaggedError<AuthenticationError>()('AuthenticationError', {
  message: Schema.String,
}) {}

export class AuthorizationError extends Schema.TaggedError<AuthorizationError>()('AuthorizationError', {
  message: Schema.String,
  accountAddress: Schema.optional(Schema.String),
}) {}

export class InvalidTokenError extends Schema.TaggedError<InvalidTokenError>()('InvalidTokenError', {
  tokenType: Schema.Literal('privy', 'session'),
}) {}

export class TokenExpiredError extends Schema.TaggedError<TokenExpiredError>()('TokenExpiredError', {
  tokenType: Schema.Literal('session'),
}) {}

/**
 * Resource-related errors
 */
export class ResourceNotFoundError extends Schema.TaggedError<ResourceNotFoundError>()('ResourceNotFoundError', {
  resource: Schema.String,
  id: Schema.String,
}) {}

export class ResourceAlreadyExistsError extends Schema.TaggedError<ResourceAlreadyExistsError>()(
  'ResourceAlreadyExistsError',
  {
    resource: Schema.String,
    id: Schema.String,
  },
) {}

/**
 * Validation errors
 */
export class ValidationError extends Schema.TaggedError<ValidationError>()('ValidationError', {
  field: Schema.String,
  message: Schema.String,
}) {}

export class InvalidSignatureError extends Schema.TaggedError<InvalidSignatureError>()('InvalidSignatureError', {
  context: Schema.String,
}) {}

export class OwnershipProofError extends Schema.TaggedError<OwnershipProofError>()('OwnershipProofError', {
  accountAddress: Schema.String,
  reason: Schema.String,
}) {}

/**
 * External service errors
 */
export class PrivyConfigError extends Schema.TaggedError<PrivyConfigError>()('PrivyConfigError', {
  message: Schema.String,
}) {}

export class PrivyTokenError extends Schema.TaggedError<PrivyTokenError>()('PrivyTokenError', {
  message: Schema.String,
}) {}

/**
 * Database errors
 */
export class DatabaseError extends Schema.TaggedError<DatabaseError>()('DatabaseError', {
  operation: Schema.String,
  cause: Schema.Unknown,
}) {}

export class TransactionError extends Schema.TaggedError<TransactionError>()('TransactionError', {
  message: Schema.String,
  cause: Schema.Unknown,
}) {}

/**
 * Business logic errors
 */
export class InsufficientPermissionsError extends Schema.TaggedError<InsufficientPermissionsError>()(
  'InsufficientPermissionsError',
  {
    resource: Schema.String,
    requiredRole: Schema.String,
    currentRole: Schema.optional(Schema.String),
  },
) {}

export class InboxPolicyViolationError extends Schema.TaggedError<InboxPolicyViolationError>()(
  'InboxPolicyViolationError',
  {
    inboxId: Schema.String,
    authPolicy: Schema.String,
    violation: Schema.String,
  },
) {}

export class SpaceEventError extends Schema.TaggedError<SpaceEventError>()('SpaceEventError', {
  spaceId: Schema.String,
  eventType: Schema.String,
  reason: Schema.String,
}) {}
