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
- [`updateMember`](#updatemember)
- [`removeMember`](#removemember)
- [`sendUpdate`](#sendupdate)
- [`sendCompactedUpdate`](#sendcompactedupdate)

---

## Event list

| Event | Helper | HTTP / WS Path | Auth | Description |
|-------|--------|----------------|------|-------------|
| `createSpace` | `createSpace()` | `/spaces` (POST) | **SIWE** + signature | Bootstrap a new Space. |
| `deleteSpace` | `deleteSpace()` | `/spaces/:id` (DELETE) | `admin` | Soft-delete a Space. |
| `createInvite` | `inviteToSpace()` | `/spaces/:id/invites` (POST) | `admin` | Send an encrypted invite. |
| `acceptInvite` | `acceptInvitation()` | `/invites/:id/accept` (POST) | Invite signature | Accept & join Space. |
| `updateMember` | `updateMember()` | `/spaces/:id/members/:accountId` (PATCH) | `admin` | Promote / demote role. |
| `removeMember` | `removeMember()` | `/spaces/:id/members/:accountId` (DELETE) | `admin` | Remove member & rotate keys. |
| `sendUpdate` | _internal_ | `/updates` (WS) | `member` | CRDT patch. |
| `sendCompactedUpdate` | _internal_ | `/updates` (WS) | `member` | Snapshot update log. |

All payloads are JSON objects transported over either:

* **WebSocket** — default for low-latency real-time sync.
* **HTTP** — optional fallback for bootstrapping or server-to-server calls.

---

## `createSpace`

| | |
|---|---|
| **Method** | `POST /spaces` (HTTP) **or** WebSocket event |
| **Auth** | Signed with the creator's _signature key_ + SIWE cookie |
| **Body** | See JSON-LD below |
| **Success** | `201 Created` with `{ "spaceId": "…" }` |
| **Errors** | `409 AlreadyExists`, `401 Unauthorized`, `422 InvalidSignature` |

```jsonld title="JSON-LD"
{
  "@context": "https://schema.org",
  "@type": "CreateAction",
  "name": "Create Hypergraph Space",
  "url": "/spaces",
  "application": "Hypergraph",
  "instrument": {
    "@type": "CryptographicKey",
    "name": "spaceKey",
    "publicKey": "<base58>"
  },
  "creator": "did:pkh:eip155:80451:<accountId>"
}
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `ciphertext` | `string(base64)` | ✔︎ | Encrypted Automerge init document. |
| `nonce` | `string(base64)` | ✔︎ | Nonce used for XChaCha20-Poly1305. |
| `memberSignaturePublicKey` | `string(base58)` | ✔︎ | Ed25519 public key. |
| `memberEncryptionPublicKey` | `string(base58)` | ✔︎ | X25519 public key. |
| `keyBox` | `object` | ✔︎ | Space key encrypted for the creator. |

### Request example

```json title="POST /spaces"
{
  "eventId": "6db7b5f0",
  "spaceId": "efc45a11",
  "ciphertext": "v8Qe…",
  "nonce": "A0nx…",
  "memberSignaturePublicKey": "9bEe…",
  "memberEncryptionPublicKey": "e1F3…",
  "keyBox": {
    "ciphertext": "3k0i…",
    "recipientPublicKey": "e1F3…",
    "authorPublicKey": "9bEe…"
  },
  "signature": "MEUCIQD…"
}
```

### Response example

```json title="201 Created"
{
  "spaceId": "efc45a11"
}
```

---

## `deleteSpace`

> TODO — coming in the next version.

---

## `createInvite`

> TODO — coming in the next version.

---

## More endpoints

The remaining endpoints follow the same structure. Until full documentation lands, refer to **type definitions** exported from the SDK:

```ts
import {
  Messages,
  SpaceEvents,
  Inboxes,
} from '@graphprotocol/hypergraph';
```

---

### Edit on GitHub

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/api-reference.md) 