# GET /connect/identity

## Overview
Retrieves public identity information for a given account address.

## HTTP Method
GET

## Route
`/connect/identity`

## Authentication
None required (public endpoint)

## Request Parameters
- `accountAddress`: The account address to look up (query parameter, required)

## Request Headers
None

## Request Body
None

## Response
### Success Response (200 OK)
Schema: `Messages.ResponseIdentity`
```json
{
  "accountAddress": "string",
  "signaturePublicKey": "string",
  "encryptionPublicKey": "string",
  "accountProof": "string",
  "keyProof": "string"
}
```

### Error Responses
- 400 Bad Request: Missing accountAddress parameter
- 404 Not Found: Identity not found
  Schema: `Messages.ResponseIdentityNotFoundError`
  ```json
  {
    "accountAddress": "string"
  }
  ```

## Domain Model
### Account
- `address`: string (primary key)
- `connectSignaturePublicKey`: string
- `connectEncryptionPublicKey`: string
- `connectAccountProof`: string
- `connectKeyProof`: string

## Implementation Details
- No authentication required (public endpoint)
- Validates required accountAddress query parameter
- Uses `getConnectIdentity` handler to fetch identity
- Returns public keys and proofs (no encrypted data)
- Returns 404 with specific error format if identity not found

## Dependencies
- `getConnectIdentity`: Fetches identity from database