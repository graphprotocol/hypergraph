# GET /identity

## Overview
Retrieves public identity information for either a Connect identity or App identity based on provided parameters.

## HTTP Method
GET

## Route
`/identity`

## Authentication
None required (public endpoint)

## Request Parameters
Query parameters:
- `accountAddress`: The account address (required)
- `signaturePublicKey`: The signature public key (optional, mutually exclusive with appId)
- `appId`: The application ID (optional, mutually exclusive with signaturePublicKey)

Note: Either `signaturePublicKey` OR `appId` must be provided, but not both.

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
  "keyProof": "string",
  "appId": "string" // Optional, only present for app identities
}
```

### Error Responses
- 400 Bad Request: 
  - Missing accountAddress
  - Missing both signaturePublicKey and appId
- 404 Not Found: Identity not found
  Schema: `Messages.ResponseIdentityNotFoundError`
  ```json
  {
    "accountAddress": "string"
  }
  ```

## Domain Model
### Account (Connect Identity)
- `address`: string (primary key)
- `connectSignaturePublicKey`: string
- `connectEncryptionPublicKey`: string
- `connectAccountProof`: string
- `connectKeyProof`: string

### AppIdentity
- `address`: string (primary key)
- `appId`: string
- `accountAddress`: string (foreign key to Account)
- `signaturePublicKey`: string
- `encryptionPublicKey`: string
- `accountProof`: string
- `keyProof`: string

## Implementation Details
- No authentication required (public endpoint)
- Validates required parameters
- Uses `getAppOrConnectIdentity` handler which:
  - If signaturePublicKey provided: searches for matching identity
  - If appId provided: searches for app identity with that appId
- Returns unified identity response format
- App identities include optional `appId` field in response

## Dependencies
- `getAppOrConnectIdentity`: Flexible identity lookup handler