# GET /spaces/:spaceId/inboxes

## Overview
Lists all public inboxes for a specific space.

## HTTP Method
GET

## Route
`/spaces/:spaceId/inboxes`

## Authentication
None required (public endpoint)

## Request Parameters
- `spaceId`: The space ID (URL parameter)

## Request Headers
None

## Request Body
None

## Response
### Success Response (200 OK)
Schema: `Messages.ResponseListSpaceInboxesPublic`
```json
{
  "inboxes": [
    {
      "id": "string",
      "spaceId": "string",
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
### SpaceInbox
- `id`: string (primary key)
- `spaceId`: string (foreign key to Space)
- `isPublic`: boolean
- `authPolicy`: string
- `encryptionPublicKey`: string
- `encryptedSecretKey`: string
- `spaceEventId`: string (foreign key to SpaceEvent)

### Space
- `id`: string (primary key)
- `inboxes`: SpaceInbox[] relation

## Implementation Details
- No authentication required (public endpoint)
- Uses `listPublicSpaceInboxes` handler to:
  - Query all inboxes for the space
  - Filter to only public inboxes (isPublic = true)
- Returns list of public inbox metadata

## Dependencies
- `listPublicSpaceInboxes`: Fetches public inboxes from database