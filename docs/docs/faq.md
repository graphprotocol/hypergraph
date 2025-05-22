---
title: Frequently Asked Questions
description: Answers to recurring questions about Hypergraph.
version: 0.0.1
tags: [faq]
---

# ❓ FAQ

## General

### What is Hypergraph?

> Hypergraph is a TypeScript-first framework for building local-first apps that sync encrypted data to a shared knowledge graph.

### Does it replace my backend?

Yes—Hypergraph **is** your data layer. You still host a thin sync server, but your business logic lives entirely on the client.

### Who is Hypergraph for?

Developers building collaborative, consumer-facing apps that require real-time data sync, end-to-end encryption, and public knowledge graph interoperability. Ideal for those who want to focus on client-side logic without managing backend infrastructure.

### What problems does Hypergraph solve?

- Real-time sync of private data across users and devices with E2EE.
- No traditional backend or database required—framework handles storage and sync.
- Publishing and consuming public data in an interoperable knowledge graph.
- Built-in user authentication and access control.
- Enables network effects by reusing existing data across apps.

### What assumptions do we make about developers?

We assume you are comfortable writing React applications in TypeScript and familiar with common UI patterns (e.g., inboxes).

### How can I integrate Hypergraph into an existing application?

You can add Hypergraph as a collaboration and privacy layer to an existing app, enabling real-time sync and end-to-end encryption while keeping your current stack for other functionality.

### Where can I find more examples or support?

Browse our GitHub repository for sample apps and open issues. Join the community through our issue tracker and discussion forums.

### How can I share feedback?

Provide feedback via GitHub issues or our upcoming feedback form linked in the docs.

### How do I get started?
See our Quickstart guide: [🚀 Quickstart](/docs/quickstart).

### What are Spaces?
Spaces are the primary grouping for users and content in Hypergraph; they represent collaboration contexts and topics. Only members of a space can access its private data.

### Where can I find the API reference?
Refer to our API documentation: [📚 API Reference](/docs/api-reference).

### How do I troubleshoot common errors?
Find solutions in our Troubleshooting guide: [🛠 Troubleshooting](/docs/troubleshooting).

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