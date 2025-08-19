# Function: getVerifiedIdentity()

> **getVerifiedIdentity**(`accountAddress`, `signaturePublicKey`, `appId`, `syncServerUri`, `chain`, `rpcUrl`): `Promise`\<\{ `accountAddress`: `string`; `encryptionPublicKey`: `string`; `signaturePublicKey`: `string`; \}\>

Defined in: [packages/hypergraph/src/identity/get-verified-identity.ts:7](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/identity/get-verified-identity.ts#L7)

## Parameters

### accountAddress

`string`

### signaturePublicKey

`null` | `string`

### appId

`null` | `string`

### syncServerUri

`string`

### chain

`Chain`

### rpcUrl

`string`

## Returns

`Promise`\<\{ `accountAddress`: `string`; `encryptionPublicKey`: `string`; `signaturePublicKey`: `string`; \}\>
