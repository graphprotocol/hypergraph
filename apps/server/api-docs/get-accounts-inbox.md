# GET /accounts/:accountAddress/inboxes/:inboxId

## Overview
Retrieves details for a specific public inbox belonging to an account.

## HTTP Method
GET

## Route
`/accounts/:accountAddress/inboxes/:inboxId`

## Authentication
None required (public endpoint)

## Request Parameters
- `accountAddress`: The account address (URL parameter)
- `inboxId`: The inbox ID (URL parameter)

## Request Headers
None

## Request Body
None

## Response
### Success Response (200 OK)
Schema: `Messages.ResponseAccountInboxPublic`
```json
{
  "inbox": {
    "id": "string",
    "accountAddress": "string",
    "isPublic": true,
    "authPolicy": "string", // "requires_auth" | "anonymous" | "optional_auth"
    "encryptionPublicKey": "string"
  }
}
```

### Error Responses
- 500 Internal Server Error: Database or server error

## Domain Model
### AccountInbox
- `id`: string (primary key)
- `accountAddress`: string (foreign key to Account)
- `isPublic`: boolean
- `authPolicy`: string
- `encryptionPublicKey`: string
- `signatureHex`: string
- `signatureRecovery`: integer

## Implementation Details
- No authentication required (public endpoint)
- Uses `getAccountInbox` handler to fetch specific inbox
- Returns public inbox details if found
- Note: Handler should verify inbox is public before returning

## Dependencies
- `getAccountInbox`: Fetches specific inbox from database