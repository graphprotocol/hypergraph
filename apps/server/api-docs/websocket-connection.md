# WebSocket Connection

## Overview
WebSocket endpoint for real-time communication between clients and server. Handles space subscriptions, updates, events, and inbox messages.

## Connection URL
`ws://[host]:[port]/?token=[sessionToken]`

## Authentication
Required - Session token as query parameter

## Connection Process
1. Client connects with session token in query parameter
2. Server validates token via `getAppIdentityBySessionToken`
3. If valid, connection established with:
   - `accountAddress`: Associated account
   - `appIdentityAddress`: App identity address
   - `subscribedSpaces`: Empty set (populated via subscriptions)
4. If invalid, connection closed

## WebSocket Message Types

### Client to Server Messages
All messages use `Messages.RequestMessage` schema, serialized/deserialized via `Messages.serialize/deserialize`.

#### subscribe-space
Subscribe to updates for a specific space.
```json
{
  "type": "subscribe-space",
  "id": "spaceId"
}
```
Response: `ResponseSpace` message with full space data

#### list-spaces
List all spaces accessible by the app identity.
```json
{
  "type": "list-spaces"
}
```
Response: `ResponseListSpaces` with array of spaces

#### list-invitations
List all invitations for the account.
```json
{
  "type": "list-invitations"
}
```
Response: `ResponseListInvitations` with invitations

#### create-space-event
Create a new space with initial event.
```json
{
  "type": "create-space-event",
  "event": { /* SpaceEvent */ },
  "keyBox": { /* KeyBox */ },
  "name": "string"
}
```
Response: `ResponseSpace` with created space

#### create-invitation-event
Create an invitation to a space.
```json
{
  "type": "create-invitation-event",
  "spaceId": "string",
  "event": { /* SpaceEvent */ },
  "keyBoxes": [ /* KeyBox[] */ ]
}
```
Response: `ResponseSpace` and broadcasts to invitee

#### accept-invitation-event
Accept a space invitation.
```json
{
  "type": "accept-invitation-event",
  "spaceId": "string",
  "event": { /* SpaceEvent */ }
}
```
Response: `ResponseSpace` and broadcasts event

#### create-space-inbox-event
Create an inbox for a space.
```json
{
  "type": "create-space-inbox-event",
  "spaceId": "string",
  "event": { /* SpaceEvent */ }
}
```
Response: `ResponseSpace` and broadcasts event

#### create-account-inbox
Create an inbox for the account.
```json
{
  "type": "create-account-inbox",
  "accountAddress": "string",
  "id": "string",
  "isPublic": boolean,
  "authPolicy": "string",
  "encryptionPublicKey": "string",
  "signature": { "hex": "string", "recovery": number }
}
```
Broadcasts to other clients of same account

#### get-latest-space-inbox-messages
Retrieve recent messages from a space inbox.
```json
{
  "type": "get-latest-space-inbox-messages",
  "spaceId": "string",
  "inboxId": "string",
  "since": "datetime" // Optional
}
```
Response: `ResponseSpaceInboxMessages`

#### get-latest-account-inbox-messages
Retrieve recent messages from an account inbox.
```json
{
  "type": "get-latest-account-inbox-messages",
  "inboxId": "string",
  "since": "datetime" // Optional
}
```
Response: `ResponseAccountInboxMessages`

#### get-account-inboxes
List all inboxes for the account.
```json
{
  "type": "get-account-inboxes"
}
```
Response: `ResponseAccountInboxes`

#### create-update
Create a CRDT update for a space.
```json
{
  "type": "create-update",
  "accountAddress": "string",
  "spaceId": "string",
  "update": "string", // Serialized update
  "signature": { "hex": "string", "recovery": number },
  "updateId": "string"
}
```
Response: `ResponseUpdateConfirmed` and broadcasts to subscribers

### Server to Client Messages

#### space-event (broadcast)
```json
{
  "type": "space-event",
  "spaceId": "string",
  "event": { /* SpaceEvent */ }
}
```

#### updates-notification (broadcast)
```json
{
  "type": "updates-notification",
  "spaceId": "string",
  "updates": {
    "updates": [ /* Update[] */ ],
    "firstUpdateClock": number,
    "lastUpdateClock": number
  }
}
```

#### space-inbox-message (broadcast)
```json
{
  "type": "space-inbox-message",
  "spaceId": "string",
  "inboxId": "string",
  "message": { /* InboxMessage */ }
}
```

#### account-inbox-message (broadcast)
```json
{
  "type": "account-inbox-message",
  "accountAddress": "string",
  "inboxId": "string",
  "message": { /* InboxMessage */ }
}
```

#### account-inbox (broadcast)
```json
{
  "type": "account-inbox",
  "inbox": { /* AccountInboxPublic */ }
}
```

## Domain Models
See individual route documentation for detailed model descriptions.

## Broadcasting Rules
- **Space events/updates**: Broadcast to all clients subscribed to the space
- **Account inbox messages**: Broadcast to all clients with same account address
- **Invitations**: Broadcast to invitee's connected clients

## Error Handling
- Invalid messages are logged but don't close connection
- Authentication failures close the connection immediately
- Database errors are logged, client may not receive response