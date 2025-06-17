---
title: API Reference
description: Low-level events and helper functions exported by the Hypergraph SDK.
version: 0.0.1
tags: [api, reference]
---

# 📚 API Reference

This section documents the main **Space Events** and the matching client-side helpers in `@graphprotocol/hypergraph` and `@graphprotocol/hypergraph-react`.

> ℹ️ The SDK abstracts most serialization, encryption and validation. You'll rarely emit raw events yourself—**Hooks** and **helper functions** should cover 95 % of use-cases. Still, understanding their wire format helps with debugging and server integration.

## Table of Contents

- [`createSpace`](#createspace)
- [`deleteSpace`](#deletespace)
- [`createInvite`](#createinvite)
- [`acceptInvite`](#acceptinvite)
- [`createSpaceInbox`](#createspaceinbox)
- [`sendUpdate`](#sendupdate)
- [`sendCompactedUpdate`](#sendcompactedupdate)

---

## Event list

| Event              | Helper             | HTTP / WS Path                   | Auth               | Description                          |
| ------------------ | ------------------ | -------------------------------- | ------------------ | ------------------------------------ |
| `createSpace`      | `createSpace()`      | `/spaces` (POST)                 | **SIWE** + signature | Bootstrap a new Space.               |
| `deleteSpace`      | `deleteSpace()`      | `/spaces/:id` (DELETE)           | `admin`            | Soft-delete a Space.                 |
| `createInvite`     | `inviteToSpace()`    | `/spaces/:id/invites` (POST)     | `admin`            | Create an invitation to a Space.     |
| `acceptInvite`     | `acceptInvitation()` | `/invites/:id/accept` (POST)     | Invite signature   | Accept an invitation & join a Space. |
| `createSpaceInbox` | `createInbox()`      | `/spaces/:id/inboxes` (POST)     | `admin`            | Create a new inbox in a Space.       |
| `sendUpdate`         | _internal_         | `/updates` (WS)                  | `member`           | Send a CRDT patch to peers.          |
| `sendCompactedUpdate` | _internal_         | `/updates` (WS)                  | `member`           | Send a snapshot of the update log.   |

All payloads are JSON objects transported over either:

- **WebSocket** — default for low-latency real-time sync.
- **HTTP** — optional fallback for bootstrapping or server-to-server calls.

---

## `createSpace`

|           |                                                      |
| --------- | ---------------------------------------------------- |
| **Method**  | `POST /spaces` (HTTP) **or** WebSocket event         |
| **Auth**    | Signed with the creator's _signature key_ + SIWE cookie |
| **Body**    | See event schema below.                              |
| **Success** | `201 Created` with `{ "spaceId": "…" }`              |
| **Errors**  | `409 AlreadyExists`, `401 Unauthorized`, `422 InvalidSignature` |

### Event Schema

The `CreateSpaceEvent` contains the initial parameters for a new space.

```typescript
export const CreateSpaceEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('create-space'),
    id: Schema.String,
    creatorAccountId: Schema.String,
  }),
  author: EventAuthor, // { accountId: string, signature: { hex: string, recovery: number } }
});
```

### Request Example

```json title="POST /spaces"
{
  "eventId": "6db7b5f0",
  "spaceId": "efc45a11",
  "transaction": {
    "type": "create-space",
    "id": "efc45a11",
    "creatorAccountId": "did:pkh:eip155:1:0x123..."
  },
  "author": {
    "accountId": "did:pkh:eip155:1:0x123...",
    "signature": {
      "hex": "0xabc...",
      "recovery": 1
    }
  }
}
```

### Response Example

```json title="201 Created"
{
  "spaceId": "efc45a11"
}
```

---

## `deleteSpace`

|           |                                                      |
| --------- | ---------------------------------------------------- |
| **Method**  | `DELETE /spaces/:id` (HTTP) **or** WebSocket event   |
| **Auth**    | `admin` role in the space                            |
| **Success** | `200 OK`                                             |
| **Errors**  | `401 Unauthorized`, `404 NotFound`                   |

### Event Schema

The `DeleteSpaceEvent` marks a space for soft-deletion. It requires referencing the hash of the previous event to maintain chain integrity.

```typescript
export const DeleteSpaceEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('delete-space'),
    id: Schema.String, // The ID of the space to delete
    previousEventHash: Schema.String,
  }),
  author: EventAuthor,
});
```

---

## `createInvite`

|           |                                                      |
| --------- | ---------------------------------------------------- |
| **Method**  | `POST /spaces/:id/invites` (HTTP) **or** WebSocket event |
| **Auth**    | `admin` role in the space                            |
| **Success** | `201 Created`                                        |
| **Errors**  | `401 Unauthorized`, `404 NotFound`, `422 Unprocessable Entity` |

### Event Schema

The `CreateInvitationEvent` creates a new single-use invitation for an account to join the space.

```typescript
export const CreateInvitationEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('create-invitation'),
    id: Schema.String, // The ID of the space
    inviteeAccountId: Schema.String, // The account ID of the user being invited
    previousEventHash: Schema.String,
  }),
  author: EventAuthor,
});
```

---

## `acceptInvite`

|           |                                                      |
| --------- | ---------------------------------------------------- |
| **Method**  | `POST /invites/:id/accept` (HTTP) **or** WebSocket event |
| **Auth**    | Signature from the invited account                 |
| **Success** | `200 OK`                                             |
| **Errors**  | `401 Unauthorized`, `404 NotFound`                   |

### Event Schema

The `AcceptInvitationEvent` is created when a user accepts an invitation to join a space. This adds them to the member list.

```typescript
export const AcceptInvitationEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('accept-invitation'),
    id: Schema.String, // The ID of the space
    previousEventHash: Schema.String,
  }),
  author: EventAuthor, // The new member
});
```

---

## `createSpaceInbox`

|           |                                                      |
| --------- | ---------------------------------------------------- |
| **Method**  | `POST /spaces/:id/inboxes` (HTTP) **or** WebSocket event |
| **Auth**    | `admin` role in the space                            |
| **Success** | `201 Created`                                        |
| **Errors**  | `401 Unauthorized`, `404 NotFound`                   |

### Event Schema

The `CreateSpaceInboxEvent` creates a new inbox within a space, which can be used for direct or broadcast messaging between members.

```typescript
export const CreateSpaceInboxEvent = Schema.Struct({
  transaction: Schema.Struct({
    type: Schema.Literal('create-space-inbox'),
    id: Schema.String, // The ID of the new inbox
    spaceId: Schema.String, // The ID of the space
    inboxId: Schema.String,
    encryptionPublicKey: Schema.String,
    secretKey: Schema.String, // Should be encrypted
    isPublic: Schema.Boolean,
    authPolicy: InboxSenderAuthPolicy, // 'all-members' | 'admins-only' | 'self-only'
    previousEventHash: Schema.String,
  }),
  author: EventAuthor,
});
```

---

## More endpoints

The remaining endpoints (`sendUpdate`, `sendCompactedUpdate`) are used internally for state synchronization and are not typically called directly. For a deeper understanding of the entire event-sourcing model, you can refer to the type definitions exported from the SDK:

```ts
import { SpaceEvents } from '@graphprotocol/hypergraph';

// e.g., SpaceEvents.CreateSpaceEvent
```

---

### Edit on GitHub

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/api-reference.md)