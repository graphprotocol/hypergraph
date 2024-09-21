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

An example where it would be interesting to see how you'd solve it: What happens if I have two series of mutations that are conflicting?

Participants:

- Client A
- Client B
- Server

The server has two events with foreign keys:

- Event X references person P1
- Event Y references person P2

Client 1 makes the following offline mutations:

1. Set the foreign key of Event X to person P2
2. Delete person P1

Client 2 makes the following offline mutations:

1. Set the foreign key of Event Y to person P1
2. Delete person P2

Then:

- Client 1 syncs with the server (this works)
- Client 2 syncs with the server (but can't apply the change because P1 no longer exists)

Ideally, the changes should be applied in the following order:

1. Set the foreign key of Event X to P2
2. Set the foreign key of Event Y to P1
3. Delete person P1
4. Delete person P2

And this might still be manageable, but the question is how complex these cases can become and whether there are circular cases that are unsolvable. Should this perhaps be formalized in some way?

The solution here are "soft deletes". What's important in terms of privacy is thought that the data values of a soft delete are actually removed. In and end-to-end encrypted environment this need to be combined with key-rotation and compaction to work properly.

## Tinybase

- How to integrate rich-text (Yjs types) editing with Tinybase?

Something like this would be great:

```js
field: {
  name: "description",
  type: schema.Uint8Array,
  onMutation: (currentField, mutation) => {
     // currentField ist ein yDoc (uint8array)
     // mutation.value ist ein Yjs update (uint8array)
     yjs.applyV2Changes(currentField, mutation.value)
  }
}
```

## How to send a wallet an invite?

- XMTP? https://docs.xmtp.org/
