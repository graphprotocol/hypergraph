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
