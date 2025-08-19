# Function: recoverSpaceInboxCreatorKey()

> **recoverSpaceInboxCreatorKey**(`event`): `string`

Defined in: [packages/hypergraph/src/inboxes/recover-inbox-creator.ts:22](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/recover-inbox-creator.ts#L22)

## Parameters

### event

#### author

\{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \} = `EventAuthor`

#### author.accountAddress

`string` = `Schema.String`

#### author.signature

\{ `hex`: `string`; `recovery`: `number`; \} = `SignatureWithRecovery`

#### author.signature.hex

`string` = `Schema.String`

#### author.signature.recovery

`number` = `Schema.Number`

#### transaction

\{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `id`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `previousEventHash`: `string`; `secretKey`: `string`; `spaceId`: `string`; `type`: `"create-space-inbox"`; \} = `...`

#### transaction.authPolicy

`"anonymous"` \| `"optional_auth"` \| `"requires_auth"` = `InboxSenderAuthPolicy`

#### transaction.encryptionPublicKey

`string` = `Schema.String`

#### transaction.id

`string` = `Schema.String`

#### transaction.inboxId

`string` = `Schema.String`

#### transaction.isPublic

`boolean` = `Schema.Boolean`

#### transaction.previousEventHash

`string` = `Schema.String`

#### transaction.secretKey

`string` = `Schema.String`

#### transaction.spaceId

`string` = `Schema.String`

#### transaction.type

`"create-space-inbox"` = `...`

## Returns

`string`
