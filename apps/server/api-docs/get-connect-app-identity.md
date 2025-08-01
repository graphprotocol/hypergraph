# GET /connect/app-identity/:appId

## Overview
Retrieves app identity information for a specific app ID and authenticated account.

## HTTP Method
GET

## Route
`/connect/app-identity/:appId`

## Authentication
Required - Privy ID token authentication

## Request Parameters
- `appId`: The application ID (URL parameter)

## Request Headers
- `privy-id-token`: Privy authentication token (required)
- `account-address`: The account address (required)

## Request Body
None

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
    // Additional fields from AppIdentity model
  }
}
```

### Error Responses
- 401 Unauthorized: Invalid authentication or insufficient permissions
- 404 Not Found: App identity not found
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

## Implementation Details
- Validates Privy token to get signer address
- Verifies signer has permission for the specified account
- Uses `findAppIdentity` handler to search for app identity by:
  - Account address
  - App ID
- Returns app identity if found, 404 if not found

## Dependencies
- `getAddressByPrivyToken`: Validates Privy token
- `isSignerForAccount`: Verifies signer permissions
- `findAppIdentity`: Searches for app identity in database