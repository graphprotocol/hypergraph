---
title: Frequently Asked Questions
description: Answers to recurring questions about Hypergraph.
version: 0.0.1
tags: [faq]
---

# ❓ FAQ

## General

### What is Hypergraph in one sentence?

> A TypeScript-first framework for building local-first apps that sync encrypted data to a shared knowledge graph.

### Does it replace my backend?

Yes—Hypergraph **is** your data layer. You still host a thin sync server, but your business logic lives entirely on the client.

---

## Technical

### Which database do you use under the hood?

None. Updates are stored as **CRDT events** on the sync server and optionally mirrored to IPFS for redundancy. Public data is published as JSON-LD on-chain.

### Is Hypergraph open-source?

100 %. Apache-2.0 license. Contributions welcome!

### How big can a Space grow?

We tested 50 k events / 10 MB snapshots on consumer laptops. Planned optimizations include **document sharding** and delta compression.

---

## Security & Privacy

### Can the server read my private data?

No. All private content is encrypted client-side with a per-Space symmetric key.

### What happens if I lose my keys?

Today you're out of luck (similar to Signal). A social recovery scheme is on the roadmap—follow [#51](https://github.com/graphprotocol/hypergraph/issues/51).

---

### Edit on GitHub

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/faq.md) 