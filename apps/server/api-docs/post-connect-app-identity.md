# POST /connect/app-identity

## Overview
Creates a new app identity for an account with session token generation and ownership verification.

## HTTP Method
POST

## Route
`/connect/app-identity`

## Authentication
Required - Privy ID token authentication

## Request Parameters
None

## Request Headers
- `privy-id-token`: Privy authentication token (required)
- `Content-Type`: application/json

## Request Body
Schema: `Messages.RequestConnectCreateAppIdentity`
```json
{
  "accountAddress": "string",
  "appId": "string",
  "address": "string",
  "ciphertext": "string",
  "signaturePublicKey": "string",
  "encryptionPublicKey": "string",
  "accountProof": "string",
  "keyProof": "string"
}
```

## Response
### Success Response (200 OK)
```json
{
  "appIdentity": {
    "address": "string",
    "appId": "string",
    "accountAddress": "string",
    "sessionToken": "string",
    "sessionTokenExpires": "datetime",
    // Additional fields
  }
}
```

### Error Responses
- 401 Unauthorized: Invalid authentication or ownership proof
- 500 Internal Server Error: Missing Privy configuration

## Domain Model
### AppIdentity
- `address`: string (primary key)
- `appId`: string
- `accountAddress`: string (foreign key to Account)
- `ciphertext`: string
- `signaturePublicKey`: string
- `encryptionPublicKey`: string
- `accountProof`: string
- `keyProof`: string
- `sessionToken`: string
- `sessionTokenExpires`: datetime
- Unique constraint: [accountAddress, appId]

## Implementation Details
- Validates Privy token and verifies signer permissions
- Verifies ownership proof using `Identity.verifyIdentityOwnership`
- Generates:
  - Random 32-byte session token (as hex string)
  - Session expiration date (30 days from creation)
- Uses `createAppIdentity` handler to:
  - Create the app identity record
  - Store encrypted data and public keys
  - Save session token for future authentication
- Returns created app identity with session token

## Dependencies
- `getAddressByPrivyToken`: Validates Privy token
- `isSignerForAccount`: Verifies signer permissions
- `Identity.verifyIdentityOwnership`: Validates ownership proofs
- `createAppIdentity`: Creates app identity record
- `bytesToHex`, `randomBytes`: For session token generation
- `Schema.decodeUnknownSync`: Validates request body schema