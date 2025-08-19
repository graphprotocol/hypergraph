# Function: prepareAccountInboxMessage()

> **prepareAccountInboxMessage**(`__namedParameters`): `Promise`\<\{ `authorAccountAddress?`: `string`; `ciphertext`: `string`; `signature?`: \{ `hex`: `string`; `recovery`: `number`; \}; \}\>

Defined in: [packages/hypergraph/src/inboxes/prepare-message.ts:47](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/prepare-message.ts#L47)

## Parameters

### \_\_namedParameters

`Readonly`\<\{ `accountAddress`: `string`; `authorAccountAddress`: `string` \| `null`; `encryptionPublicKey`: `string`; `inboxId`: `string`; `message`: `string`; `signaturePrivateKey`: `string` \| `null`; \}\>

## Returns

`Promise`\<\{ `authorAccountAddress?`: `string`; `ciphertext`: `string`; `signature?`: \{ `hex`: `string`; `recovery`: `number`; \}; \}\>
