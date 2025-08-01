# POST /connect/identity

## Overview
Creates a new identity for an account with encryption and signature keys. Includes ownership verification.

## HTTP Method
POST

## Route
`/connect/identity`

## Authentication
Required - Privy ID token authentication

## Request Parameters
None

## Request Headers
- `privy-id-token`: Privy authentication token (required)
- `Content-Type`: application/json

## Request Body
Schema: `Messages.RequestConnectCreateIdentity`
```json
{
  "keyBox": {
    "accountAddress": "string",
    "signer": "string",
    "ciphertext": "string",
    "nonce": "string"
  },
  "signaturePublicKey": "string",
  "encryptionPublicKey": "string",
  "accountProof": "string",
  "keyProof": "string"
}
```

## Response
### Success Response (200 OK)
Schema: `Messages.ResponseConnectCreateIdentity`
```json
{
  "success": true
}
```

### Error Response (400 Bad Request)
Schema: `Messages.ResponseIdentityExistsError`
```json
{
  "accountAddress": "string"
}
```

### Other Error Responses
- 401 Unauthorized: Invalid authentication or ownership proof
- 500 Internal Server Error: Missing Privy configuration

## Domain Model
### Account
- `address`: string (primary key)
- `connectAddress`: string (unique)
- `connectCiphertext`: string
- `connectNonce`: string
- `connectSignaturePublicKey`: string
- `connectEncryptionPublicKey`: string
- `connectAccountProof`: string
- `connectKeyProof`: string
- `connectSignerAddress`: string

## Implementation Details
- Validates Privy token and ensures it matches the signer in the keyBox
- Verifies ownership proof using `Identity.verifyIdentityOwnership`:
  - Validates account ownership
  - Validates signature public key
  - Validates proofs against the blockchain
- Uses `createIdentity` handler to:
  - Create or update the Account record
  - Store encrypted identity data
  - Store public keys and proofs
- Returns success or specific error for existing identity

## Dependencies
- `getAddressByPrivyToken`: Validates Privy token
- `Identity.verifyIdentityOwnership`: Validates ownership proofs
- `createIdentity`: Creates identity record
- `Schema.decodeUnknownSync`: Validates request body schema
- Chain configuration (CHAIN, RPC_URL) for blockchain verification