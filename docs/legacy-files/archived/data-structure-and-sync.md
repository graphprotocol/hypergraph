# Data structure & Sync

## One CRDT Document per Space

- Can be fully decentralized
- No schema solution (especially no evolving schema existing yet except for research)
- In case there are lots of change the CRDT document might become very large even with compaction (already supported by Yjs)
- Separation between read/write is not built in an would be exploratory to build on top
- Easiest to ship it early (using Secsync)

## Sync multiple CRDT document

- Can be fully decentralized
- No schema solution (especially no evolving schema existing yet except for research) - tricky since you are always document based
- Separation between read/write is not built in an would be exploratory to build on top
- Needs expanding Secsync or a new solution which probably would be Beehive & Beelay (timeline is a concern here?)

## Livestore with one DB per Space

- Requires a central sync server to ensure the order of the events
- Strong and established schema
- It's a lot of exploration
- Can connect to multiple Event histories (but can't have dependencies between them). Think of isolated data in one database.
- You can have multiple LiveStore instances in one app: Real use-case is a dashboard over multiple organizations (each being their own DB).
- Audit trail
- Allows for more custom conflict resolution
- Works well for AI (tool calling) - sqlite-vec
- Syncing timelines is a concern here

Rules to apply to avoid rebase-conflicts:

- On conflict resolution change you need to reapply the whole history with the new rules
- Only soft-deletes are allowed (content can be deleted though)
- Foreign-keys must be nullable to avoid conflicts when rebasing

## Data per Space

Each space has multiple `Nodes`. Each `Node` can either be an `Entity` or a `Triple` in indicating a relationship between two `Entities`.

### Proposal

Each `Node` is a small CRDT document by itself and the content of the node is derived from the Yjs document.

This would allow to setup an event log per space. There can be 3 kinds of operations:

- set
- delete

### Operations

#### Set

```json
{
  "spaceId": "abc",
  "nodeId": "xyz",
  "type": "set",
  "content": "base64 encoded yjs update"
}
```

#### Delete

```json
{
  "spaceId": "abc",
  "nodeId": "xyz",
  "type": "delete"
}
```

### Rules

- `delete` always wins over `set`
- `set` updates must contain a commutative operation (CRDT update)

Therefor no conflicts can occur.

### Syncing

With a single sync server we could rely on an ordered event log per space managed by the server.

To make sure we can sync even when switching sync server we should create a structure that allows to sync in a decentralized fashion. Merkel-search-trees seem to be a good fit for this.

#### Merkel-search-trees

- https://inria.hal.science/hal-02303490/document
- https://github.com/domodwyer/merkle-search-tree

#### End-to-End Encryption

The actual content should be encrypted. Therefor we want a structure like this:

```json
{
  "spaceId": "abc",
  "nodeId": "xyz",
  "ciphertext": "base64", // contains the type and content in case it's a `set`
  "nonce": "base64",
  "commitment": "base64", // needed?
  "signature": "base64"
}
```

For the Merke-search-tree we probably would use the hash of the whole structure above.

### Downsides

- Currently doesn't support any kind of access control inside a space
- Doesn't allow to sync only a part of a space

### Open Questions

- What if an Entity is deleted? Should we delete all Triples that reference it? When does this happen?
- Do we need some form of access control inside a space? read/write access?
- What algorithm to use for key agreement? DCGKA?
- How to manage removing members and changes happened by them after their removal?
