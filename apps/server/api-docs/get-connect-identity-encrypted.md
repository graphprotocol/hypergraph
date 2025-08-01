# GET /connect/identity/encrypted

## Overview
Retrieves the encrypted identity data for an authenticated account.

## HTTP Method
GET

## Route
`/connect/identity/encrypted`

## Authentication
Required - Privy ID token authentication

## Request Parameters
None

## Request Headers
- `privy-id-token`: Privy authentication token (required)
- `account-address`: The account address to retrieve identity for (required)

## Request Body
None

## Response
### Success Response (200 OK)
Schema: `Messages.ResponseIdentityEncrypted`
```json
{
  "keyBox": {
    "accountAddress": "string",
    "ciphertext": "string",
    "nonce": "string",
    "signer": "string"
  }
}
```

### Error Responses
- 401 Unauthorized: Invalid authentication or insufficient permissions
- 500 Internal Server Error: Missing Privy configuration

## Domain Model
### Account
- `address`: string (primary key)
- `connectCiphertext`: string
- `connectNonce`: string
- `connectSignerAddress`: string

## Implementation Details
- Validates Privy token to get signer address
- Verifies signer has permission for the specified account
- Uses `getConnectIdentity` handler to fetch encrypted identity data
- Returns encrypted keyBox with:
  - Account address
  - Encrypted ciphertext
  - Nonce for decryption
  - Signer address

## Dependencies
- `getAddressByPrivyToken`: Validates Privy token
- `isSignerForAccount`: Verifies signer permissions
- `getConnectIdentity`: Fetches identity from database