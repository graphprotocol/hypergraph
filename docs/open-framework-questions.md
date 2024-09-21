# Open Questions

- What kind of query language do we want?

## LiveStore discussion

- How to organize spaces? In the current thinking each store is one space. Since you can load multiple stores this is nice, because you can sync them separately. Can livestore load multiple sqlite databases?
- Can we map Tables, Rows and Cells to a Yjs sync structure?
- Investigate undo/redo of Tinybase

### Benefits of LiveStore

- reactive queries
- more powerful datatypes than Tinybase (blob which would be great for Yjs)
- high performances data access

### How to sync events

#### ActualBudget / Evolu model

- Hybrid Logical Clock timestamps
- Last write wins model for conflicts
- No support for rich-text (in this case last write wins needs/can be replaced with Yjs merge)
- You only can have set/deletions of attributes (no or only nullable foreign keys)
- No transactions

#### Sorting the events by logic

- The idea would be to resort the events to a valid chain in a deterministic way. No idea how to approach it or if there are unsolvable cases. Gut feeling: maybe with certain conditions, but not if transactions are allowed.

## Tinybase

- How to integrate rich-text (Yjs types) editing with Tinybase?

## How to send a wallet an invite?

- XMTP? https://docs.xmtp.org/
