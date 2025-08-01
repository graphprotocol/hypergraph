# GET /connect/spaces

## Overview
Retrieves all spaces associated with an authenticated account, including space information, app identities, and key boxes.

## HTTP Method
GET

## Route
`/connect/spaces`

## Authentication
Required - Privy ID token authentication

## Request Parameters
None

## Request Headers
- `privy-id-token`: Privy authentication token (required)
- `account-address`: The account address to retrieve spaces for (required)

## Request Body
None

## Response
### Success Response (200 OK)
```json
{
  "spaces": [
    {
      "id": "string",
      "infoContent": "hex string",
      "infoAuthorAddress": "string",
      "infoSignatureHex": "string",
      "infoSignatureRecovery": "number",
      "name": "string",
      "appIdentities": [
        {
          "appId": "string",
          "address": "string"
        }
      ],
      "keyBoxes": [
        {
          "id": "string",
          "ciphertext": "string",
          "nonce": "string",
          "authorPublicKey": "string"
        }
      ]
    }
  ]
}
```

### Error Responses
- 401 Unauthorized: Invalid or missing authentication
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
- `appIdentities`: AppIdentity[] relation

### SpaceKey
- `id`: string (primary key)
- `spaceId`: string (foreign key to Space)
- `keyBoxes`: SpaceKeyBox[] relation

### SpaceKeyBox
- `id`: string (primary key)
- `spaceKeyId`: string (foreign key to SpaceKey)
- `ciphertext`: string
- `nonce`: string
- `authorPublicKey`: string
- `accountAddress`: string (foreign key to Account)

### AppIdentity
- `appId`: string
- `address`: string (primary key)
- `accountAddress`: string (foreign key to Account)

## Implementation Details
- Uses `getAddressByPrivyToken` to validate the Privy token and get signer address
- Uses `isSignerForAccount` to verify the signer has permission for the account
- Uses `listSpacesByAccount` handler to fetch spaces
- Converts space data to response format, including:
  - Converting `infoContent` from bytes to hex string
  - Filtering key boxes to only include those with content
  - Mapping app identities to simplified format

## Dependencies
- `getAddressByPrivyToken`: Validates Privy token
- `isSignerForAccount`: Verifies signer permissions
- `listSpacesByAccount`: Fetches spaces from database