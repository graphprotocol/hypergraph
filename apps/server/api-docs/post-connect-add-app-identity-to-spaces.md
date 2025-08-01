# POST /connect/add-app-identity-to-spaces

## Overview
Adds an app identity to multiple spaces, granting the app access to those spaces.

## HTTP Method
POST

## Route
`/connect/add-app-identity-to-spaces`

## Authentication
Required - Privy ID token authentication

## Request Parameters
None

## Request Headers
- `privy-id-token`: Privy authentication token (required)
- `Content-Type`: application/json

## Request Body
Schema: `Messages.RequestConnectAddAppIdentityToSpaces`
```json
{
  "accountAddress": "string",
  "appIdentityAddress": "string",
  "spacesInput": [
    {
      "spaceId": "string",
      // Additional space-specific data
    }
  ]
}
```

## Response
### Success Response (200 OK)
```json
{
  "space": {
    // Space object or array of spaces
  }
}
```

### Error Responses
- 401 Unauthorized: Invalid authentication or insufficient permissions
- 500 Internal Server Error: Missing Privy configuration

## Domain Model
### AppIdentity
- `address`: string (primary key)
- `accountAddress`: string (foreign key to Account)
- `appId`: string
- `spaces`: Space[] relation (many-to-many)

### Space
- `id`: string (primary key)
- `appIdentities`: AppIdentity[] relation (many-to-many)

### Account
- `address`: string (primary key)
- `appIdentities`: AppIdentity[] relation

## Implementation Details
- Validates Privy token to get signer address
- Verifies signer has permission for the specified account
- Uses `addAppIdentityToSpaces` handler to:
  - Verify the app identity belongs to the account
  - Add the app identity to each specified space
  - Update the many-to-many relationship
- Returns updated space information

## Dependencies
- `getAddressByPrivyToken`: Validates Privy token
- `isSignerForAccount`: Verifies signer permissions
- `addAppIdentityToSpaces`: Updates space-app identity relationships
- `Schema.decodeUnknownSync`: Validates request body schema