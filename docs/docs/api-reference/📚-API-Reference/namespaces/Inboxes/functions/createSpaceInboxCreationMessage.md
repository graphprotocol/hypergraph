# Function: createSpaceInboxCreationMessage()

> **createSpaceInboxCreationMessage**(`__namedParameters`): `Promise`\<\{ `event`: \{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `id`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `previousEventHash`: `string`; `secretKey`: `string`; `spaceId`: `string`; `type`: `"create-space-inbox"`; \}; \}; `spaceId`: `string`; `type`: `"create-space-inbox-event"`; \}\>

Defined in: [packages/hypergraph/src/inboxes/create-inbox.ts:66](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/create-inbox.ts#L66)

## Parameters

### \_\_namedParameters

`CreateSpaceInboxParams`

## Returns

`Promise`\<\{ `event`: \{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `id`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `previousEventHash`: `string`; `secretKey`: `string`; `spaceId`: `string`; `type`: `"create-space-inbox"`; \}; \}; `spaceId`: `string`; `type`: `"create-space-inbox-event"`; \}\>
