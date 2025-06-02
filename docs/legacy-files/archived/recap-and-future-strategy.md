## Introduction

The goal of this document is to structure my thoughts and opinions in a concise way so we can make informed decisions on the next steps.

## Recap of the last couple weeks

1. Authentication - we investigated how to establish encryption keys with Wallets. XMTP uses a technique where they use the signature of a nonce value stored on the server to recover a stable encryption key for message encryption. We can use XMTP directly or use the same technique to establish encryption keys for end-to-end encrypted data sync.
2. Demo showing end-to-end encrypted data sync on top of Yjs & Automerge that is leveraging a defined Schema - we have a working prototype that shows how to sync data between two clients using Yjs and Automerge. The data is end-to-end encrypted and the schema is defined in a way that it's easy to read and write. We experimented with LiveStore and Tinybase which we believe are both not good fits. Both could be used as stores, but sync would require a rebase technique with manual conflict resolution or a lax schema and again using a CRDT engine on top to sync the data.
3. Schema design and implementation including relations - based on the GRC-20 spec we created a library on top of Automerge that allows to define a schema with multiple types per entity as well as relations.
4. GRC-20 spec feedback and alternative design - several discussion in the chat, call and the alternative spec in the docs folder

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
- Key management (Key rotation when members are leaving the group is the hard part)
- Invitation
- Permissions (affects Key Management)
- Identity

## Sync

For unencrypted data in a document structure there are established solutions.

When it comes to encrypted data there is Secsync relying on a central server. Jazz afaik as and both rely on finding the missing changes. Other solutions try to be fully decentralized e.g. Nextgraph. The upcoming Automerge sync also wants to go in this direction.

The hard part is not only syncing one entities/documents, but to identify which ones you need to update. Personally I'm wondering about the data storage overhead. Further problems that need to be considered are:

- prioritized sync (loading one particular document first)
- progress indication
- handling errors (can you abort and retry if state is lost)
- compaction for of history to heavily reduce the data that needs to be synced
- shallow document/entity loading to retract history

When considering the GRC-20 spec we need to think how to sync data back from a public graph. Ideally the indexer have similar capabilities as the native CRDT sync engine. We can do naive approaches, but long term we probably want a solid approach and this is not trivial. Note: One idea is to accompany every change with a CRDT that is published publicly as well.

### Key Management

Managing encryption keys for a a group is quite tricky problem. In general it's easy to establish a key for a group, but rotating the key is the hard part.

Example of a key rotation problem:

- Who do you allow to rotate the keys? e.g. you have commenter that informs you that his devices was stolen. can they initiate a new key? probably not. can any member in a group do so or only the admins?
- How do you recover from failed key rotations? (ignore them and move on?)

The easy way and what most do: just trust everyone with access in the group, but this model might now work well for all use-cases.

### Permissions

In general it's straight forward to do read/write permissions based on space roles. This could be made more granular per entity with a custom permission system, but probably out of scope.

There were some attempts like UCAN to make permissions very granular, but I haven't seen it in action yet.

### Invitation

The most common way to handle this is invitation links (Jazz, DXOS, Serenity). There are a couple of fine details that need to be considered. The main issue is: you can't just invite someone via Email directly to a space without them having an encryption key that you know beforehand or you send a secret (which then can't go through a server).

### Identity

The easy answer would be to use a wallet and XMTP for a stable encryption key. Account recovery on top is not that crazy either, but when you try to come up with key rotation or a multi-device setup things become quite tricky. Even more so in case you want to allow decentralization.

## Overview of Local-first frameworks and tools

### Evolu

https://evolu.com/

### Yjs

https://github.com/yjs/yjs

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

### Livestore

Strongly typed and doesn't use a CRDT.

The sync system will probably be rebasing with manual conflict resolution.

### Tinybase

A database with a CRDT build in (MergableStores) that works for unencrypted data.

Nice UX, wipes data locally if it doesn't match the schema.

## Strategies for the future

The first question we should answer is: what is the direction we want to go?

> Do we want enable local-first development that integrates into the GRC-20 spec or do we want to build a great local-first framework and have a GRC-20 integration on top of it?

Of course we probably want to have both, but in reality I believe the outcome looks very different.

One we have clarity I see multiple possible scenarios:

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

## Personal conclusion

What to do heavily depends on the direction we want to go. Personally I'm find triple stores and the GRC-20 spec very fascinating, but my gut-feeling tells me that it's not helpful to establish a local-first framework.

If the goal is to establish GRC-20, then building an end-to-end encrypted local-first framework is a good way to support it.

Based on this we can probably can sit together and evaluate a path forward. Personally I would take a lot of short-cuts to get as fast as possible to a state where internal/external devs can build things with it e.g. once per month a 1-2 day Hackathon using it and giving feedback.

I tried to think through how I would go about these two different directions:

## Local-first focused framework

### Schema and CRDT

In general I like schemas and therefor I would define a schema that defines a clear structure that looks like a SQL-DB with certain limitations. It probably would also allow nested structures like any other NoSQL store or SQL-Store with JSON support. In addition you can be very flexible in terms of types (as long as Automerge supports it).

For rich-text editing you would probably use the automerge-prosemirror integration.

While Automerge is document based I would try to built this as a layer on top of Automerge (we already have this). What we should add is the ability to define in the schema what stays in the main document and what data is stored in a sub-document. When writing and querying data this mostly should be abstracted. The overhead for sub-documents should be minimal, but what's currently missing in SecSync and only limited in the existing Automerge sync is the ability to do prioritized sync. This is important for large data sets. Automerge is working on it.

Why Automerge and not Yjs? Yjs is the best for real-time collaboration at the moment and I'm a big fan, but Automerge is actively working towards local-first supporting full decentralization and end-to-end encryption. They have more resources and a clear vision. So in terms of long-term plans Automerge seems to be the better choice.

In terms of migrations I have an idea: Schema-changes are defined via an API and this one requires you to implement migration functions that fit the types.

### Sync

SecSync does the job for now, but long-term we probably just want to use the sync Automerge is working on.

### Key Management

Ink&Switch is working on Beehive, but it's not ready yet and there are a lot of unknowns in terms of UX.

This is where blockchains could really shine. We could use the chain as a way to store active members of a group and store the encrypted private/public keys on the chain.

We could start with something simple that relies on a server managing the latest state. We can experiment and verify what works for users and what doesn't. In parallel we can develop the blockchain part or we just delay it and move to the blockchain later once we are sure due smart contracts being expensive to develop.

Alternatively we might just like Beehive and be happy with it.

### Identity

This highly depends on key management. If we use a key management relying not relying on a blockchain we could make wallets completely optional. This would open it up to a larger audience that doesn't want to integrate wallets or use Privy.

If we rely on blockchains the embedded wallets from Privy look promising, but I haven't looked into the details yet. I worked on and with the OPAQUE protocol which would allow to build embedded wallets so people don't have to use Privy.

If we require wallets we could even abstract them away and the build a auth layer where developers and users don't have to know about wallets.

### Invitation

Existing systems like Keybase require the users, but there is a way to get to a good experience to have link invitations.
https://github.com/serenity-kit/invitation/

XMTP could be used to directly add users or at least send them an invite. Not sure how active it's used in the eco-system. Personally I would stick to link-invitations and explore adding users directly later on.

### Permissions

Beehive afaik is only focusing on read/write permissions at the time being. We could focus on that and give developers the options to add more where needed.

### GRC-20 integration

This probably would be a separate library that allows you to specify where your schema maps to GRC-20 attributes, types and so on.

In addition it feels like a very natural extension to the framework to allow you to pull in data from public graphs, showing the different states and diffs from local data compared to public data. Probably we want to store the last known public data that matches the entries in the local data. Ideally the indexers offer a event log based API to allow syncing updates in without aggressively querying the indexer or downloading the entire space.

We can give guides for people who want to integrate into the GRC-20 spec.

## GRC-20 focused framework

### Schema and CRDT

The schema probably is where we see the difference to the other approach. It allows entities to have multiple types and is limited to the GRC-20 base types and relations. The beautiful aspect of this is that we can much clearly communicate the framework focus in terms of that it provides you amazing tooling for building GRC-20 based apps. The downside is that the group of developers interested in local-first, but not GRC-20 will probably focus on other tools. I believe for example that a lot local-first apps probably never will have public data and the whole story with public spaces and publishing data makes little sense to their use-case.

In order to use rich-text editing it's probably recommended to use our editor with GRC-20 blocks.

The flexible design of the GRC-20 requires a different architecture on how to store data in one or multiple Automerge documents, which is less performant. With the other design I can store entities in maps per type. Here I need to store them in one entities map. We would need to explore at what amount of entities this starts to become an issue and what kind of caching/indexing we can do to counter the issues.

Migrations could be implemented similar to what I described above.

### Sync

This I see identical to the other version.

### Key Management

This I see identical to the other version.

### Identity

Here integrating with wallets probably makes the most sense. You anyway need a wallet to make any kind of change on a public space.

### Invitation

This I see identical to the other version.

### Permissions

I assume there is an existing permission model defined (which I'm not aware of) of who is a member with certain permissions for a space and so on. By default we probably want this exact model. This might influence key management as well.

### GRC-20 integration

Since data is shaped on the same spec syncing from and to the public space is a lot easier and can be a lot more automated.

The main thing I'm still missing conceptional is what kind of indexers can offer to allow syncing updates in without aggressively querying the indexer or downloading the entire space.
