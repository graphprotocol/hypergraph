# Function: signup()

> **signup**(`signer`, `_walletClient`, `smartAccountClient`, `accountAddress`, `syncServerUri`, `addressStorage`, `keysStorage`, `identityToken`, `chain`, `rpcUrl`): `Promise`\<\{ `accountAddress`: `` `0x${string}` ``; `keys`: [`IdentityKeys`](../type-aliases/IdentityKeys.md); \}\>

Defined in: [packages/hypergraph/src/connect/login.ts:28](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/login.ts#L28)

## Parameters

### signer

[`Signer`](../type-aliases/Signer.md)

### \_walletClient

### smartAccountClient

`SmartAccountClient`

### accountAddress

`` `0x${string}` ``

### syncServerUri

`string`

### addressStorage

[`Storage`](../type-aliases/Storage.md)

### keysStorage

[`Storage`](../type-aliases/Storage.md)

### identityToken

`string`

### chain

`Chain`

### rpcUrl

`string`

## Returns

`Promise`\<\{ `accountAddress`: `` `0x${string}` ``; `keys`: [`IdentityKeys`](../type-aliases/IdentityKeys.md); \}\>
