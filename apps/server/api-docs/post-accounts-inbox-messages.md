# POST /accounts/:accountAddress/inboxes/:inboxId/messages

## Overview
Posts a new message to an account inbox. Authentication requirements depend on the inbox's auth policy.

## HTTP Method
POST

## Route
`/accounts/:accountAddress/inboxes/:inboxId/messages`

## Authentication
Depends on inbox auth policy:
- `requires_auth`: Signature and account address required
- `anonymous`: No authentication allowed
- `optional_auth`: Authentication optional

## Request Parameters
- `accountAddress`: The account address (URL parameter)
- `inboxId`: The inbox ID (URL parameter)

## Request Headers
- `Content-Type`: application/json

## Request Body
Schema: `Messages.RequestCreateAccountInboxMessage`
```json
{
  "ciphertext": "string",
  "signature": {
    "hex": "string",
    "recovery": "number"
  }, // Optional based on auth policy
  "authorAccountAddress": "string" // Optional based on auth policy
}
```

## Response
### Success Response (200 OK)
```json
{}
```
Empty object on success. Message is also broadcast via WebSocket.

### Error Responses
- 400 Bad Request: Invalid authentication for inbox policy
- 403 Forbidden: Not authorized to post to inbox
- 404 Not Found: Inbox not found
- 500 Internal Server Error: Server error

## Domain Model
### AccountInbox
- `id`: string (primary key)
- `accountAddress`: string (foreign key to Account)
- `authPolicy`: string ("requires_auth" | "anonymous" | "optional_auth")
- `messages`: AccountInboxMessage[] relation

### AccountInboxMessage
- `id`: string (auto-generated UUID)
- `accountInboxId`: string (foreign key to AccountInbox)
- `ciphertext`: string
- `signatureHex`: string (optional)
- `signatureRecovery`: integer (optional)
- `authorAccountAddress`: string (optional)
- `createdAt`: datetime

## Implementation Details
- Fetches inbox to check auth policy
- Validates authentication based on policy:
  - `requires_auth`: Both signature and authorAccountAddress required
  - `anonymous`: Neither allowed
  - `optional_auth`: Both must be provided together or neither
- If authenticated:
  - Recovers public key from signature using `Inboxes.recoverAccountInboxMessageSigner`
  - Verifies public key belongs to claimed account via `getAppOrConnectIdentity`
- Creates message using `createAccountInboxMessage`
- Broadcasts message to WebSocket subscribers via `broadcastAccountInboxMessage`

## Dependencies
- `getAccountInbox`: Fetches inbox configuration
- `Inboxes.recoverAccountInboxMessageSigner`: Recovers signer from signature
- `getAppOrConnectIdentity`: Verifies identity ownership
- `createAccountInboxMessage`: Persists message
- `broadcastAccountInboxMessage`: WebSocket broadcast
- `Schema.decodeUnknownSync`: Validates request body