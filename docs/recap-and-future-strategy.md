## Introduction

The goal of this document is to structure my thoughts and opinions in a concise way so we can make informed decisions on the next steps.

## Recap of the last couple weeks

1. Authentication - wer investigated how to establish encryption keys with Wallets. XMTP uses a technique where they use the signature of a nonce value stored on the server to recover a stable encryption key for message encryption. We can use XMTP directly or use the same technique to establish encryption keys for end-to-end encrypted data sync.
2. Demo showing end-to-end encrypted data sync on top of Yjs & Automerge that is leveraging a defined Schema - we have a working prototype that shows how to sync data between two clients using Yjs and Automerge. The data is end-to-end encrypted and the schema is defined in a way that it's easy to read and write. We experimented with LiveStore and Tinybase which we believe are both not good fits. Both could be used as stores, but sync would require a rebase technique with manual conflict resolution or a lax schema and again using a CRDT engine on top to sync the data.
3. Schema design and implementation including relations - based on the GRC-20 spec we created a library on top of Automerge that allows to define a schema with multiple types per entity as well as relations.
4. GRC-20 spec feedback and alternative design - see all the discussion in the chat and the alternative spec in the docs folder

## Current state of the art

In order to make an informed decision I want to summarize the current state of the art in local-first development and give a brief overview of the tools and frameworks that are available.

For we need to talk about the different key factors that differs from existing Web2 apps:

- Local-first
- Decentralized/Centralized
- End-to-end encrypted

Building local-first apps that are centralized and not end-to-end encrypted is possible today. There are companies like Electric or Zero how are building frameworks. The UX is/will be great. The main downside is that you need to trust a provider for sync and securing your data. Migrations are are much harder in this setting compared to DB as single-source-of-truth Web2 apps.

Building local-first apps that are centralized and end-to-end encrypted is possible today. Afaik Jazz is doing it and the app Serenity that I build was in that direction. The main downside is that you need to trust a single service with the sync. If the service allows an export you can move to another service. Due end-to-end encryption the service can't read your data which limits a lot of features: email notifications, server based search, etc. Migrations are even trickier.

Building local-first apps that are decentralized and end-to-end encrypted is very hard. Ink&Switch is doing it with Beehive. Evolu has announced to release a new sync soon that works fully decentralized. NextGraph is also working on it. All of them are not ready or have quite some limitations compared to existing UX. A very tough problem is what to do with data that was synced from another client, you built upon it and later on your client realizes that the other client was already removed. Do you keep the data? Do you indicate it as deleted? Do you remove it?

## Main areas to consider when building a local-first app

- Sync
- Key management (Rotation is the hard part)
- Invitation
- Permissions
- Identity

## Sync

Syncing back data from a public graph is tricky!!!

- Either every (text) change is accompanied with a CRDT

### Key Management

- Rotation is the hard part. One specific problem is: who do you allow to rotate the keys?

e.g. you have commenter that informs you that his devices was stolen. can they initiate a new key? probably not. can any member in a group do so or only the admins?

how do you recover from failed key rotations? (ignore them and move on)

The easy way and what most do: just trust everyone with access in the group

### Permissions

TODO

## Overview of Local-first frameworks and tools

### Evolu

https://evolu.com/

### Yjs

### Jazz

https://jazz.io/

### Zero

https://zerosync.dev/

### Electric

https://electric-sql.com/

PGlite (Postgres compiled to WASM) on the client + a custom concept "Shapes" to define which data to sync locally. The data is not end-to-end encrypted.

### Automerge

- No ReactNative support atm
- Requires WASM

### Beehive

https://www.inkandswitch.com/beehive/notebook/

### NextGraph

https://nextgraph.com/

### DXOS

Works on top of Automerge

Interesting vision
https://docs.dxos.org/guide/

### What about others?

- Tinybase (nice UX, wipes data locally if it doesn't match the schema)
- Livestore (strongly typed - migrations and sync unknown)
- Yjs

## Strategies for the future

The first question we should answer is: what is the direction we want to go?

> Do we want enable local-first development that integrates into the GRC-20 spec or do we want to build a great local-first framework and have a GRC-20 integration on top of it?

Of course we probably want to have both, but in reality I believe the outcome looks very different.

One we have clarify I see multiple possible scenarios:

- Build something completely from ground up (CRDTs, Sync, Key Management, etc.)
- Leverage existing CRDTs and built on top of those (Yjs, Automerge - they are all document based)
- Leverage existing CRDTs and further Layers (e.g. Sync & Key Management via Beehive, NextGraph)
- Integrate into multiple existing tools (Zero, Electric, Jazz, Evolu, NextGraph) and provide the missing parts for a Web3 integration e.g. a Wallet auth plugin for Jazz

## Evaluation of Web3

In general local-first can work completely without Web3. There are things that Web3 offers that can be beneficial, but by requiring it we probably limit possible adoption. I think it can be quite useful, but it requires a deeper analysis. e.g. I could imagine that a wallet could be encrypted by the user email/password and it's secure due the OPAQUE protocol, but for people who prefer the Wallet as primary auth method they can also use it.

### Benefits of Web3

- Blockchains allow us to give us an immutable ordered log of events. This is a massive issue in distributed systems.
- IPFS protocol is great for storing data.
- ENS is great for naming and finding data.
- Wallets are great for managing keys.
- Smart contracts are great for managing access control.

### Downsides of Web3

- Wallets are not established and developers and users often rather want alternatives (Passkeys, Passwords, Email-login)
- Retrieving data in IPFS can be slower compared to S3 depending on the setup
- IPFS has no access-control built in - can be built on top of it, but it's not there by default
- Smart contracts are require special expertise

## Other considerations not mentioned

One thing almost nobody has explored is having only only a subset of the data end-to-end encrypted. For example when building a patient-information system the emails and appointments could be not end-to-end encrypted, but the medical records and chats between doctor and patient are.

This has some benefits, but personally I haven't explored the direction.

## How would I imagine a perfect scenario? (OPINION)

### Schema and CRDT

In general I like schemas and therefor I would define a schema that defines a clear structure that looks like a SQL-DB with certain limitations.

While Automerge is document based I would try to built this as a layer on top of Automerge (we already have this). What we should add is the ability to define in the schema what stays in the main document and what data is stored in a sub-document. When writing and querying data this mostly should be abstracted. The overhead vor sub-documents should be minimal, but what's currently missing in SecSync and only limited in the existing Automerge sync is the ability to do prioritized sync. This is important for large data sets. Automerge is working on it.

Why Automerge and not Yjs? Yjs is the best for real-time collaboration at the moment and I'm a big fan, but Automerge is actively working towards local-first supporting full decentralization and end-to-end encryption. They have more resources and a clear vision. So in terms of long-term plans Automerge seems to be the better choice.

In terms of migrations I have an idea: Schema-changes are defined via an API and this one requires you to implement migration functions that fit the types.

### Sync

SecSync does the job for now, but long-term we probably just want to use the sync Automerge is working on.

### Key Management

Ink&Switch is working on Beehive, but it's not ready yet and there are a lot of unknowns in terms of UX.

This is where blockchains could really shine. We could use the chain as a way to store active members of a group and store the encrypted private/public keys on the chain.

We could start with something simple that relies on a server managing the latest state. We can experiment and verify what works for users and what doesn't. In parallel we can develop the blockchain part or we just delay it and move to the blockchain later once we are sure due smart contracts being expensive to develop.

### Identity

Personally I'm not a fan of the wallet experience. The embedded wallets from Privy look great, but I haven't looked into the details yet. I worked on and with the OPAQUE protocol which would allow to build embedded wallets. The main concern for me is the UX of signing messages to e.g. create an invitation. Due our explorations we can use wallets as the primary auth method, but again it comes with some limitations. Ideally this most of the time hidden away from the user and only required in certain cases e.g. when doing a crucial action like creating an invitation link to a space/group.

### Invitation

Existing systems like Keybase require the users, but there is a way to get to a good experience to have link invitations.
https://github.com/serenity-kit/invitation/

XMTP could be used to directly add users or at least send them an invite. Not sure how active it's used in the eco-system. Personally I would stick to link-invitations and explore adding users directly later on.

## Personal conclusion

What to do heavily depends on the direction we want to go. Personally I'm find triple stores and the GRC-20 spec very fascinating, but my gut-feeling tells me that it's not helpful to establish a local-first framework.

If the goal is to establish GRC-20, then building an end-to-end encrypted local-first framework is a good way to support it.

Based on this we can probably can sit together and evaluate a path forward. Personally I would take a lot of short-cuts to get as fast as possible to a state where internal/external devs can build things with it e.g. once per month a 1-2 day hackathon using it and giving feedback.
