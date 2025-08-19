# Function: signedUpdateMessage()

> **signedUpdateMessage**(`__namedParameters`): `object`

Defined in: [packages/hypergraph/src/messages/signed-update-message.ts:27](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/messages/signed-update-message.ts#L27)

## Parameters

### \_\_namedParameters

`SignedMessageParams`

## Returns

`object`

### accountAddress

> `readonly` **accountAddress**: `string` = `Schema.String`

### signature

> `readonly` **signature**: `object` = `SignatureWithRecovery`

#### signature.hex

> `readonly` **hex**: `string` = `Schema.String`

#### signature.recovery

> `readonly` **recovery**: `number` = `Schema.Number`

### spaceId

> `readonly` **spaceId**: `string` = `Schema.String`

### type

> `readonly` **type**: `"create-update"`

### update

> `readonly` **update**: `Uint8Array`\<`ArrayBufferLike`\> = `Schema.Uint8Array`

### updateId

> `readonly` **updateId**: `string` = `Schema.String`
