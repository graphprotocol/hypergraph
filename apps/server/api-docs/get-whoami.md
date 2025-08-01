# GET /whoami

## Overview
Returns the account address associated with the current session token.

## HTTP Method
GET

## Route
`/whoami`

## Authentication
Required - Bearer token authentication (session token)

## Request Parameters
None

## Request Headers
- `Authorization`: Bearer token (required) - Format: `Bearer <sessionToken>`

## Request Body
None

## Response
### Success Response (200 OK)
```
<account-address-string>
```
Returns the account address as plain text.

### Error Responses
- 401 Unauthorized: Invalid or missing session token

## Domain Model
### AppIdentity
- `sessionToken`: string (indexed)
- `accountAddress`: string (foreign key to Account)
- `sessionTokenExpires`: datetime

## Implementation Details
- Extracts session token from Authorization header
- Uses `getAppIdentityBySessionToken` handler to:
  - Look up app identity by session token
  - Verify token is not expired
  - Return associated account address
- Returns account address as plain text response

## Dependencies
- `getAppIdentityBySessionToken`: Validates session token and retrieves account