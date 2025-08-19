# Function: getAccountInbox()

> **getAccountInbox**(`__namedParameters`): `Promise`\<\{ `accountAddress`: `string`; `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}\>

Defined in: [packages/hypergraph/src/inboxes/get-list-inboxes.ts:38](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/get-list-inboxes.ts#L38)

## Parameters

### \_\_namedParameters

`Readonly`\<\{ `accountAddress`: `string`; `inboxId`: `string`; `syncServerUri`: `string`; \}\>

## Returns

`Promise`\<\{ `accountAddress`: `string`; `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}\>
