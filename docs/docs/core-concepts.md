---
title: Core Concepts
description: Key ideas behind Hypergraph—Spaces, Identities, Inboxes, and the Knowledge Graph.
version: 0.0.1
tags: [concepts, architecture]
---

# 🧠 Core Concepts

Hypergraph re-imagines traditional client–server apps as **local-first**, **peer-syncing** knowledge graphs. Understanding the following building blocks will help you design applications that feel real-time, privacy-preserving, and interoperable by default.

## Table of Contents

- [Spaces](#spaces)
- [Identities](#identities)
- [Inboxes](#inboxes)
- [Knowledge Graph](#knowledge-graph)
- [Events & CRDTs](#events--crdts)
- [Security Model](#security-model)

---

## Spaces

A **Space** is the fundamental unit of collaboration.

* Think of it as a **folder**, **Slack channel**, or **Google Doc**—it groups both *people* and *data*.
* Each Space maps 1-to-1 with an **Automerge** document for conflict-free offline editing.
* Membership & roles (`member`, `editor`, `admin`) are tracked by an append-only _Space Event Log_.

### Lifecycle events

| Event | Purpose |
|-------|---------|
| `createSpace` | Bootstrap a new Space and establish its first encryption key. |
| `deleteSpace` | Mark the Space as deleted (soft delete). |
| `updateMember` | Promote or demote a member role. |
| `removeMember` | Kick a member and rotate keys. |
| `createInvite` / `acceptInvite` | Securely invite users—keys are boxed to the invitee's public key. |

All events are **signed** by the author and **verified** by the sync server before broadcast.

## Identities

Every user controls an **Identity** defined by three asymmetric keypairs:

1. **Signature keys** — Ed25519 keys used to sign Space Events.
2. **Encryption keys** — X25519 keys used to encrypt private Space data.
3. **Account keys** — An EVM account (via wallet) used for SIWE authentication.

Identities are encrypted with a **session token** and stored in the browser (`localStorage`, IndexedDB, or the filesystem in React Native). This keeps the SDK _stateless_—you can log in on multiple devices without a backend.

## Inboxes

An **Inbox** is a lightweight message queue that delivers updates or DMs.

* **Account Inboxes** belong to a single user.
* **Space Inboxes** broadcast to all members of a Space.

Inboxes can be **public** (anyone can read) or **private** (E2EE). Auth policies decide who may send:

```ts
type InboxSenderAuthPolicy = 'any' | 'members' | 'admins';
```

## Knowledge Graph

Public data isn't shoved into a siloed SQL DB. Instead, Hypergraph publishes JSON-LD to a decentralized Knowledge Graph (IPFS + Polygon Amoy smart contracts).

Benefits:

* **Composability** — one app's `City` objects can be queried by another app.
* **Network effects** — each new Space or entity enriches the shared graph.

A TypeScript codegen tool (see the _TypeSync app_ in `/apps/typesync`) maps your domain models to on-chain schemas so you can query them like regular React hooks.

## Events & CRDTs

1. A client mutates the Automerge document (`doc.put(…​)`).
2. The SDK encodes the change as **CRDT updates**.
3. Updates are encrypted with the current **spaceKey** and batched into a `sendUpdate` event.
4. The sync server verifies, persists, and broadcasts updates to online peers.
5. Peers apply the updates; conflicts resolve automatically.

When the event log grows large, a peer may emit `sendCompactedUpdate`—a snapshot that starts a fresh log segment.

## Security Model

| Threat | Mitigation |
|--------|-----------|
| Server reads private data | **E2EE** — all document updates are encrypted client-side with a per-Space symmetric key. |
| Forged events | **Signature verification** for every event using the author's public key. |
| Stale clients | Each event carries `lastKnownSpaceEventId`; server rejects out-of-date mutations. |
| Key leakage on member removal | **Key rotation** through `removeMember` → generates a new `spaceKey`. |

---

### Edit on GitHub

[✏️ Suggest changes](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/core-concepts.md) 