---
title: Key Features
description: Why choose Hypergraph? A tour of the core capabilities that set it apart from traditional client-server stacks.
version: 0.0.1
tags: [features, overview]
---

# 🌟 Key Features

Hypergraph is **more than a database**—it's a complete data layer for building collaborative, local-first apps. Below is a concise tour of the capabilities you get out of the box.

## Table of Contents

- [Local-first by design](#local-first-by-design)
- [End-to-end encryption](#end-to-end-encryption)
- [Graph-based data model](#graph-based-data-model)
- [Conflict-free sync (CRDTs)](#conflict-free-sync-crdts)
- [Spaces & fine-grained auth](#spaces--fine-grained-auth)
- [Web3-native identities](#web3-native-identities)
- [Headless React hooks](#headless-react-hooks)
- [Offline support & optimistic UI](#offline-support--optimistic-ui)
- [Tiny sync server](#tiny-sync-server)
- [Open standards](#open-standards)

---

## Local-first by design

Data is **persisted first on the client**—not on a remote database. Users can create, read and mutate data instantly with zero network latency. Changes sync asynchronously when connectivity is available.

* **No loading spinners.** State is always available locally.
* **No data silos.** You own the raw event log.

## End-to-end encryption

Every update is encrypted **on the client** using XChaCha20-Poly1305. Only members of a Space possess the symmetric key, so neither the sync server nor The Graph can read private data.

* **Automatic key rotation** when members join/leave.
* **Multi-device**: each device holds its own key pair.

## Graph-based data model

Under the hood, Hypergraph stores JSON-LD triples that map nicely to **knowledge graphs**. This makes it trivial to expose public data on-chain or query it with SPARQL later.

## Conflict-free sync (CRDTs)

We use **Automerge** (a JSON CRDT) to merge concurrent edits without conflicts. Snapshots are automatically compacted to keep payloads small.

## Spaces & fine-grained auth

A **Space** groups both *people* and *data*. Roles (`admin`, `member`, `viewer`) are enforced on the wire and checked again client-side.

## Web3-native identities

Authentication is handled by **SIWE (Sign-In With Ethereum)**. Each user signs requests with an Ed25519 key that can be deterministically derived from their wallet.

## Headless React hooks

The `@graphprotocol/hypergraph-react` package exposes ergonomic hooks:

```ts
const { space, updates, send } = useHypergraph(spaceId);
```

They work in **React Server Components** and React Native alike.

## Offline support & optimistic UI

Because writes land locally first, you can render results immediately. Hypergraph retries sync in the background with exponential back-off.

## Tiny sync server

All the server does is **relay encrypted events** and store blobs. It's stateless, horizontally scalable and can be deployed on a hobby tier instance.

## Open standards

* **JSON-LD** for semantics
* **IPFS** for public blobs
* **DID / SIWE** for identity

---

Ready to dive deeper? Check out the [Quickstart](/docs/quickstart) or browse the full [API Reference](/docs/api-reference).

---

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/key-features.md) 