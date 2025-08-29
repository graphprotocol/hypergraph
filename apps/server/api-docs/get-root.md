# GET /

## Overview
Health check endpoint that returns server status and version information.

## HTTP Method
GET

## Route
`/`

## Authentication
None required

## Request Parameters
None

## Request Headers
None

## Request Body
None

## Response
### Success Response (200 OK)
```
Server is running (v0.0.14)
```

## Domain Model
This endpoint does not interact with any domain models.

## Implementation Details
- Simple health check endpoint
- Returns plain text response
- Hardcoded version string in the response
- No database queries or complex logic

## Error Handling
This endpoint does not have specific error handling.