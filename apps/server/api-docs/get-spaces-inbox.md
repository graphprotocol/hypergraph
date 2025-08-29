# GET /spaces/:spaceId/inboxes/:inboxId

## Overview
Retrieves details for a specific public inbox within a space.

## HTTP Method
GET

## Route
`/spaces/:spaceId/inboxes/:inboxId`

## Authentication
None required (public endpoint)

## Request Parameters
- `spaceId`: The space ID (URL parameter)
- `inboxId`: The inbox ID (URL parameter)

## Request Headers
None

## Request Body
None

## Response
### Success Response (200 OK)
Schema: `Messages.ResponseSpaceInboxPublic`
```json
{
  "inbox": {
    "id": "string",
    "spaceId": "string",
    "isPublic": true,
    "authPolicy": "string", // "requires_auth" | "anonymous" | "optional_auth"
    "encryptionPublicKey": "string"
  }
}
```

### Error Responses
- 500 Internal Server Error: Database or server error

## Domain Model
### SpaceInbox
- `id`: string (primary key)
- `spaceId`: string (foreign key to Space)
- `isPublic`: boolean
- `authPolicy`: string
- `encryptionPublicKey`: string
- `encryptedSecretKey`: string
- `spaceEventId`: string (foreign key to SpaceEvent)

## Implementation Details
- No authentication required (public endpoint)
- Uses `getSpaceInbox` handler to fetch specific inbox
- Returns public inbox details if found
- Note: Handler should verify inbox is public before returning

## Dependencies
- `getSpaceInbox`: Fetches specific inbox from database