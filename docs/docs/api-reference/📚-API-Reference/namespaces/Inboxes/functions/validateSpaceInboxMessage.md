# Function: validateSpaceInboxMessage()

> **validateSpaceInboxMessage**(`message`, `inbox`, `spaceId`, `syncServerUri`, `chain`, `rpcUrl`): `Promise`\<`boolean`\>

Defined in: [packages/hypergraph/src/inboxes/message-validation.ts:7](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/message-validation.ts#L7)

## Parameters

### message

#### authorAccountAddress?

`string` = `...`

#### ciphertext

`string` = `Schema.String`

#### createdAt

`Date` = `Schema.Date`

#### id

`string` = `Schema.String`

#### signature?

\{ `hex`: `string`; `recovery`: `number`; \} = `...`

#### signature.hex

`string` = `Schema.String`

#### signature.recovery

`number` = `Schema.Number`

### inbox

[`SpaceInboxStorageEntry`](../../../../type-aliases/SpaceInboxStorageEntry.md)

### spaceId

`string`

### syncServerUri

`string`

### chain

`Chain`

### rpcUrl

`string`

## Returns

`Promise`\<`boolean`\>
