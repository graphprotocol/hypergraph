---
title: Core Concepts
description: Key ideas behind Hypergraph—Spaces, Identities, Inboxes, and the Knowledge Graph.
version: 0.0.1
tags: [concepts, architecture]
---

# 🧠 Core Concepts

Hypergraph re-imagines traditional client–server apps as **local-first**, **peer-syncing** knowledge graphs. Understanding the following building blocks will help you design applications that feel real-time, privacy-preserving, and interoperable by default.

## Table of Contents

- [Knowledge Graphs and GRC-20](#knowledge-graphs-and-grc-20)
- [Spaces](#spaces)
- [Identities](#identities)
- [Inboxes](#inboxes)
- [Events & CRDTs](#events--crdts)
- [Security Model](#security-model)

---
## Knowledge Graphs and GRC-20

Hypergraph adopts **GRC-20** as its canonical data format. Every mutation you perform through the Hypergraph SDK—whether it's adding a note, uploading a photo, or inviting a collaborator—ultimately becomes a set of GRC-20 values bundled into an edit. Once the edit is posted, it becomes part of the global knowledge graph—instantly connecting your data to a world of interoperable apps, spaces, and users.

### 1. The GRC-20 Standard
The GRC-20 standard defines how knowledge is structured, shared, and connected in a decentralized, composable way—enabling interoperability across web3 applications. It specifies the core building blocks: entities, types, properties, relations, and values. Read the [GRC-20 spec on GitHub](https://github.com/graphprotocol/graph-improvement-proposals/blob/main/grcs/0020-knowledge-graph.md).

### 2. Core Data Model Concepts

To illustrate the core pieces of a knowledge graph, we'll break down a single sentence:

> **"Teresa, a photographer, owns a Fujifilm camera."**

#### The Value Model
In GRC-20, each **entity** is a node in the graph with a list of **values**. Each value attaches a **property** (by ID) and a literal value (plus options). Properties define the data type and constraints for their values. **Relations** are first-class objects that connect entities and can have their own properties and metadata.

**Example property definition:**
```json
{
  "id": "PROFESSION_ATTR_ID",
  "data_type": "TEXT"
}
```

**Example entity with values:**
```json
{
  "id": "Teresa_ID",
  "values": [
    { "property": "PROFESSION_ATTR_ID", "value": "photographer" }
  ]
}
```

**Example in code:**
```ts
Graph.createEntity({
  name: 'Teresa',
  types: [PERSON_TYPE_ID],
  values: [
    { property: PROFESSION_ATTR_ID, value: 'photographer' }
  ]
});
```

#### IDs: Where Do They Come From?
Every entity, attribute, and relation has a unique ID (usually a string, e.g. `PERSON_TYPE_ID`). These are generated per your schema or space, and are required for all operations.

#### Entities & Types
**Entity:** A unique thing in the graph (e.g., `Teresa`, `Camera`).
**Type:** A category for entities (e.g., `Person`, `Device`).

```ts
const PERSON_TYPE_ID = 'PERSON_TYPE_ID';
const DEVICE_TYPE_ID = 'DEVICE_TYPE_ID';
const PROFESSION_ATTR_ID = 'PROFESSION_ATTR_ID';
const BRAND_ATTR_ID = 'BRAND_ATTR_ID';

const { id: cameraId, ops: cameraOps } = Graph.createEntity({
  name: 'Camera',
  types: [DEVICE_TYPE_ID],
  values: [
    { property: BRAND_ATTR_ID, value: 'Fujifilm' },
  ],
});

const { id: teresaId, ops: teresaOps } = Graph.createEntity({
  name: 'Teresa',
  types: [PERSON_TYPE_ID],
  values: [
    { property: PROFESSION_ATTR_ID, value: 'photographer' },
  ],
});
```

#### Properties vs. Relations
- **Property:** Attaches data to a single entity (e.g., `Camera` → `brand` → `Fujifilm`).
- **Relation:** Connects two entities (e.g., `Teresa` → `owns` → `Camera`). Relations are themselves entities and can have their own properties (e.g., `date_acquired`).

```ts
const OWNS_REL_TYPE_ID = 'OWNS_REL_TYPE_ID';
const DATE_ACQUIRED_ATTR_ID = 'DATE_ACQUIRED_ATTR_ID';

import { getEntityRelations } from '@graphprotocol/grc-20';

// 1️⃣ Fetch existing owns relations for Teresa
const existingOwns = getEntityRelations(teresaId, PersonSchema, doc).owns;

// 2️⃣ Only create if none exists pointing to this camera
if (!existingOwns.find(rel => rel.id === cameraId)) {
  const { ops: ownsOps } = Graph.createRelation({
    fromEntity: teresaId,
    toEntity: cameraId,
    relationType: OWNS_REL_TYPE_ID,
    values: [
      { property: DATE_ACQUIRED_ATTR_ID, value: Graph.serializeDate(new Date('2020-03-15')) },
    ],
  });
  // add ownsOps to your edit batch…
}
```

**Relation as triple in JSON:**
```json
{
  "entity": "OwnsRelation_ID",
  "attribute": "date_acquired",
  "value": {
    "type": 5, // Time
    "value": "2020-03-15T00:00:00.000Z"
  }
}
```

#### Searching and Idempotency
The SDK generates a new ID for every entity or relation you create—even if an identical relation already exists. To avoid duplicates:

- **Query existing relations** via your GraphQL endpoint with a filter on `from`, `relationType`, and `to`.
- **Use** `getEntityRelations` (from `@graphprotocol/grc-20`) on a local handle to list current relations for an entity:

```ts
import { getEntityRelations } from '@graphprotocol/grc-20';

// Returns all non-deleted owns relations from Teresa
const relations = getEntityRelations(teresaId, PersonSchema, doc).owns;
```

- **Check** if a relation linking the same entities already exists before calling `Graph.createRelation`.

If you call `createRelation` without checking, you'll end up with multiple relation entities of the same type between the same entities. Deduplication is the responsibility of your application or schema governance.

#### Minimal Edit Example
Bundle all operations into an edit:
```ts
const ops = [...cameraOps, ...teresaOps, ...ownsOps];
// Publish ops as an edit (see SDK docs for publishing)
```

Let's bring together everything we've learned above—including our example sentence—into a complete GRC-20–compliant TypeScript example that is fully composable with Hypergraph.

```ts title="example.ts"
// Example: "Teresa, a photographer, owns a Fujifilm camera."
// This script uses the @graphprotocol/grc-20 SDK to:
// 1. Create a Camera entity with a brand property
// 2. Create a Teresa entity with a profession property
// 3. Check for an existing 'owns' relation from Teresa to the Camera
// 4. If none exists, create the 'owns' relation entity
// 5. Bundle all operations into a single edit (ops array)

import { Graph, getEntityRelations } from '@graphprotocol/grc-20';

// Replace these with actual IDs from your schema/space
const PERSON_TYPE_ID = 'PERSON_TYPE_ID';
const DEVICE_TYPE_ID = 'DEVICE_TYPE_ID';
const PROFESSION_ATTR_ID = 'PROFESSION_ATTR_ID';
const BRAND_ATTR_ID = 'BRAND_ATTR_ID';
const OWNS_REL_TYPE_ID = 'OWNS_REL_TYPE_ID';
const DATE_ACQUIRED_ATTR_ID = 'DATE_ACQUIRED_ATTR_ID';

// 1️⃣ Create the Camera entity with a brand property
const { id: cameraId, ops: cameraOps } = Graph.createEntity({
  name: 'Fujifilm camera',
  types: [DEVICE_TYPE_ID],
  values: [
    { property: BRAND_ATTR_ID, value: 'Fujifilm' },
  ],
});

// 2️⃣ Create the Teresa entity with a profession property
const { id: teresaId, ops: teresaOps } = Graph.createEntity({
  name: 'Teresa',
  types: [PERSON_TYPE_ID],
  values: [
    { property: PROFESSION_ATTR_ID, value: 'photographer' },
  ],
});

// 3️⃣ Fetch existing 'owns' relations for Teresa
const existingOwns = getEntityRelations(teresaId, PersonSchema, doc).owns;

// 4️⃣ Only create if none exists pointing to this camera
let ownsOps = [];
if (!existingOwns.find(rel => rel.id === cameraId)) {
  const { ops } = Graph.createRelation({
    fromEntity: teresaId,
    toEntity: cameraId,
    relationType: OWNS_REL_TYPE_ID,
    values: [
      { property: DATE_ACQUIRED_ATTR_ID, value: Graph.serializeDate(new Date('2020-03-15')) },
    ],
  });
  ownsOps = ops;
}

// 5️⃣ Combine all ops into a single edit
const ops = [...cameraOps, ...teresaOps, ...ownsOps];
console.log('Ops ready for publishing:', ops);

// (Optional) Publish the edit
// Graph.publishEdit({ ops });
```
--- 

#### Mental Model Recap
- **Entities** are things.
- **Properties** are facts about things, and define the data type.
- **Relations** connect things (and can have their own properties).
- **Values** are atomic facts (entity, property, value).
- **Edits** are batches of changes.

#### Cheat Sheet Table
| Concept  | Example in Sentence | GRC-20 Term | Code Snippet |
|----------|---------------------|-------------|--------------|
| Entity   | Teresa, Camera      | Entity      | `{ id, name }` |
| Type     | Person, Device      | Type        | `types: [PERSON_TYPE_ID]` |
| Property | profession, brand   | Property    | `{ id: BRAND_ATTR_ID, data_type: 'TEXT' }` |
| Relation | owns                | Relation Entity | `createRelation()` |
| Value    | `Teresa → profession → photographer` | Value | `{ property: PROFESSION_ATTR_ID, value: 'photographer' }` |
| Edit     | batch of all values | Edit        | `ops: [...]` |

---

_All of the above is not just theory—Hypergraph puts it to work for you._ **When you call the SDK or its React hooks, Hypergraph turns your mutations into values, bundles them into edits, encrypts them (if the Space is private), and syncs them peer-to-peer or anchors them on-chain if the data is public.** As a developer you think in entities and hooks; behind the scenes Hypergraph speaks pure GRC-20.

---

All of these building blocks are specified by the GRC-20 standard and created in code with the GRC-20 SDK.

### 3. The GRC-20 SDK
The [`@graphprotocol/grc-20`](https://www.npmjs.com/package/@graphprotocol/grc-20) SDK is a toolkit for building, reading, and writing GRC-20-compliant knowledge graphs. It provides APIs for creating entities, types, properties, and relations, and handles serialization, publishing to IPFS, and onchain anchoring—making it easy to implement the GRC-20 standard in your apps.

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

:::tip Best Practice
**Always check for an existing relation (by `from`, `to`, and `relationType`) before creating a new one.**

This prevents duplicate relations, keeps your data model clean, and avoids ambiguity in queries and UI. The GRC-20 SDK will create a new relation entity every time unless you check first.
:::

:::info Terminology Update
In the latest GRC-20 spec, what were previously called "triples" are now called "values." The "value type" is now called "data type," and data types are defined on the property, not the value. This change makes the model simpler and validation more robust.
:::

**Note:** The data service validates that each value matches the property's data type.

