# GET /accounts/:accountAddress/inboxes

## Overview
Lists all public inboxes for a specific account.

## HTTP Method
GET

## Route
`/accounts/:accountAddress/inboxes`

## Authentication
None required (public endpoint)

## Request Parameters
- `accountAddress`: The account address (URL parameter)

## Request Headers
None

## Request Body
None

## Response
### Success Response (200 OK)
Schema: `Messages.ResponseListAccountInboxesPublic`
```json
{
  "inboxes": [
    {
      "id": "string",
      "accountAddress": "string",
      "isPublic": true,
      "authPolicy": "string", // "requires_auth" | "anonymous" | "optional_auth"
      "encryptionPublicKey": "string"
    }
  ]
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

### Account
- `address`: string (primary key)
- `inboxes`: AccountInbox[] relation

## Implementation Details
- No authentication required (public endpoint)
- Uses `listPublicAccountInboxes` handler to:
  - Query all inboxes for the account
  - Filter to only public inboxes (isPublic = true)
- Returns list of public inbox metadata

## Dependencies
- `listPublicAccountInboxes`: Fetches public inboxes from database