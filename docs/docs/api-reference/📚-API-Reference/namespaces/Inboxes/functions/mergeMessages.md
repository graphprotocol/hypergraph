# Function: mergeMessages()

> **mergeMessages**(`existingMessages`, `existingSeenIds`, `newMessages`): `object`

Defined in: [packages/hypergraph/src/inboxes/merge-messages.ts:3](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/merge-messages.ts#L3)

## Parameters

### existingMessages

[`InboxMessageStorageEntry`](../../../../type-aliases/InboxMessageStorageEntry.md)[]

### existingSeenIds

`Set`\<`string`\>

### newMessages

[`InboxMessageStorageEntry`](../../../../type-aliases/InboxMessageStorageEntry.md)[]

## Returns

`object`

### messages

> **messages**: [`InboxMessageStorageEntry`](../../../../type-aliases/InboxMessageStorageEntry.md)[]

### seenMessageIds

> **seenMessageIds**: `Set`\<`string`\>
