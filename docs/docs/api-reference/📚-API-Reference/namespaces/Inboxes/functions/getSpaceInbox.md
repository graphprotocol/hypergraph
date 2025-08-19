# Function: getSpaceInbox()

> **getSpaceInbox**(`__namedParameters`): `Promise`\<\{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `creationEvent`: \{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `id`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `previousEventHash`: `string`; `secretKey`: `string`; `spaceId`: `string`; `type`: `"create-space-inbox"`; \}; \}; `encryptionPublicKey`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; \}\>

Defined in: [packages/hypergraph/src/inboxes/get-list-inboxes.ts:26](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/get-list-inboxes.ts#L26)

## Parameters

### \_\_namedParameters

`Readonly`\<\{ `inboxId`: `string`; `spaceId`: `string`; `syncServerUri`: `string`; \}\>

## Returns

`Promise`\<\{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `creationEvent`: \{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `id`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `previousEventHash`: `string`; `secretKey`: `string`; `spaceId`: `string`; `type`: `"create-space-inbox"`; \}; \}; `encryptionPublicKey`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; \}\>
