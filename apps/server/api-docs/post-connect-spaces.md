# POST /connect/spaces

## Overview
Creates a new space with initial configuration, including encryption keys and space information.

## HTTP Method
POST

## Route
`/connect/spaces`

## Authentication
Required - Privy ID token authentication

## Request Parameters
None

## Request Headers
- `privy-id-token`: Privy authentication token (required)
- `Content-Type`: application/json

## Request Body
Schema: `Messages.RequestConnectCreateSpaceEvent`
```json
{
  "accountAddress": "string",
  "event": {
    // SpaceEvent object
  },
  "keyBox": {
    // KeyBox object
  },
  "infoContent": "hex string",
  "infoSignature": {
    "hex": "string",
    "recovery": "number"
  },
  "name": "string"
}
```

## Response
### Success Response (200 OK)
```json
{
  "space": {
    "id": "string",
    // Space object
  }
}
```

### Error Responses
- 401 Unauthorized: Invalid authentication or insufficient permissions
- 500 Internal Server Error: Missing Privy configuration

## Domain Model
### Space
- `id`: string (primary key)
- `name`: string
- `infoContent`: bytes
- `infoAuthorAddress`: string (foreign key to Account)
- `infoSignatureHex`: string
- `infoSignatureRecovery`: integer
- `events`: SpaceEvent[] relation
- `members`: Account[] relation
- `keys`: SpaceKey[] relation

### SpaceEvent
- `id`: string (primary key)
- `event`: string (serialized event data)
- `state`: string
- `counter`: integer
- `spaceId`: string (foreign key to Space)

### SpaceKey
- `id`: string (primary key)
- `spaceId`: string (foreign key to Space)
- `keyBoxes`: SpaceKeyBox[] relation

### SpaceKeyBox
- `ciphertext`: string
- `nonce`: string
- `authorPublicKey`: string
- `accountAddress`: string (foreign key to Account)

## Implementation Details
- Validates Privy token to get signer address
- Verifies signer has permission for the specified account
- Converts hex info content to bytes
- Uses `createSpace` handler to:
  - Create the space record
  - Store the initial space event
  - Create encryption key boxes
- Returns the created space object

## Dependencies
- `getAddressByPrivyToken`: Validates Privy token
- `isSignerForAccount`: Verifies signer permissions
- `createSpace`: Creates space and related records
- `Schema.decodeUnknownSync`: Validates request body schema
- `Utils.hexToBytes`: Converts hex strings to byte arrays