# API Routes Summary

## HTTP Endpoints

### Health Check
- **GET /** - Server status check

### Connect API (Privy Authentication)
- **GET /connect/spaces** - List spaces for authenticated account
- **POST /connect/spaces** - Create new space
- **POST /connect/add-app-identity-to-spaces** - Add app identity to spaces
- **POST /connect/identity** - Create connect identity
- **GET /connect/identity/encrypted** - Get encrypted identity data
- **GET /connect/app-identity/:appId** - Get app identity by ID
- **POST /connect/app-identity** - Create app identity

### Identity API
- **GET /whoami** - Get current account from session token
- **GET /connect/identity** - Get public connect identity (public)
- **GET /identity** - Get identity by public key or app ID (public)

### Inbox API (Public)
- **GET /spaces/:spaceId/inboxes** - List public space inboxes
- **GET /spaces/:spaceId/inboxes/:inboxId** - Get space inbox details
- **POST /spaces/:spaceId/inboxes/:inboxId/messages** - Post to space inbox
- **GET /accounts/:accountAddress/inboxes** - List public account inboxes
- **GET /accounts/:accountAddress/inboxes/:inboxId** - Get account inbox details
- **POST /accounts/:accountAddress/inboxes/:inboxId/messages** - Post to account inbox

## WebSocket Endpoints

### Connection
- **ws://?token=[sessionToken]** - Establish WebSocket connection

### Message Types
- **subscribe-space** - Subscribe to space updates
- **list-spaces** - List accessible spaces
- **list-invitations** - List pending invitations
- **create-space-event** - Create new space
- **create-invitation-event** - Invite to space
- **accept-invitation-event** - Accept invitation
- **create-space-inbox-event** - Create space inbox
- **create-account-inbox** - Create account inbox
- **get-latest-space-inbox-messages** - Get recent inbox messages
- **get-latest-account-inbox-messages** - Get recent account messages
- **get-account-inboxes** - List account inboxes
- **create-update** - Create CRDT update

### Broadcast Events
- **space-event** - Space event notification
- **updates-notification** - CRDT updates
- **space-inbox-message** - New inbox message
- **account-inbox-message** - New account message
- **account-inbox** - Account inbox created

## Authentication Methods

1. **Privy ID Token**: Used by Connect app endpoints
   - Header: `privy-id-token`
   - Validates signer permissions

2. **Session Token**: Used by app identities
   - Header: `Authorization: Bearer <token>`
   - 30-day expiry

3. **Public Endpoints**: No authentication required
   - Identity lookups
   - Public inbox access

## Common Response Formats

### Success
- 200 OK with JSON response
- Empty object `{}` for successful writes

### Errors
- 400 Bad Request - Invalid parameters
- 401 Unauthorized - Authentication failed
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 500 Internal Server Error - Server error