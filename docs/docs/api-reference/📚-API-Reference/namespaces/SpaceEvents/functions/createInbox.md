# Function: createInbox()

> **createInbox**(`__namedParameters`): `Effect`\<\{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `id`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `previousEventHash`: `string`; `secretKey`: `string`; `spaceId`: `string`; `type`: `"create-space-inbox"`; \}; \}, `undefined`\>

Defined in: [packages/hypergraph/src/space-events/create-inbox.ts:7](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/space-events/create-inbox.ts#L7)

## Parameters

### \_\_namedParameters

#### author

\{ `accountAddress`: `string`; `encryptionPublicKey`: `string`; `signaturePrivateKey`: `string`; `signaturePublicKey`: `string`; \}

#### author.accountAddress

`string` = `Schema.String`

#### author.encryptionPublicKey

`string` = `Schema.String`

#### author.signaturePrivateKey

`string` = `Schema.String`

#### author.signaturePublicKey

`string` = `Schema.String`

#### authPolicy

`"anonymous"` \| `"optional_auth"` \| `"requires_auth"`

#### encryptionPublicKey

`string`

#### inboxId

`string`

#### isPublic

`boolean`

#### previousEventHash

`string`

#### secretKey

`string`

#### spaceId

`string`

## Returns

`Effect`\<\{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `id`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `previousEventHash`: `string`; `secretKey`: `string`; `spaceId`: `string`; `type`: `"create-space-inbox"`; \}; \}, `undefined`\>
