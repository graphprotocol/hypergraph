# Function: recoverAccountInboxCreatorKey()

> **recoverAccountInboxCreatorKey**(`inbox`): `string`

Defined in: [packages/hypergraph/src/inboxes/recover-inbox-creator.ts:7](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/recover-inbox-creator.ts#L7)

## Parameters

### inbox

#### accountAddress

`string` = `Schema.String`

#### authPolicy

`"anonymous"` \| `"optional_auth"` \| `"requires_auth"` = `InboxSenderAuthPolicy`

#### encryptionPublicKey

`string` = `Schema.String`

#### inboxId

`string` = `Schema.String`

#### isPublic

`boolean` = `Schema.Boolean`

#### signature

\{ `hex`: `string`; `recovery`: `number`; \} = `SignatureWithRecovery`

#### signature.hex

`string` = `Schema.String`

#### signature.recovery

`number` = `Schema.Number`

## Returns

`string`
