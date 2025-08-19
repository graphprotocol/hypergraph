# Function: recoverSpaceInboxMessageSigner()

> **recoverSpaceInboxMessageSigner**(`message`, `spaceId`, `inboxId`): `string`

Defined in: [packages/hypergraph/src/inboxes/recover-inbox-message-signer.ts:6](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/recover-inbox-message-signer.ts#L6)

## Parameters

### message

#### authorAccountAddress?

`string` = `...`

#### ciphertext

`string` = `Schema.String`

#### signature?

\{ `hex`: `string`; `recovery`: `number`; \} = `...`

#### signature.hex

`string` = `Schema.String`

#### signature.recovery

`number` = `Schema.Number`

### spaceId

`string`

### inboxId

`string`

## Returns

`string`
