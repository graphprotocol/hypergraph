# Function: encryptAndSignSpaceInfo()

> **encryptAndSignSpaceInfo**(`__namedParameters`): `object`

Defined in: [packages/hypergraph/src/space-info/encrypt-and-sign-space-info.ts:18](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/space-info/encrypt-and-sign-space-info.ts#L18)

## Parameters

### \_\_namedParameters

`EncryptAndSignInfoParams`

## Returns

`object`

### accountAddress

> **accountAddress**: `string`

### infoContent

> **infoContent**: `Uint8Array`\<`ArrayBuffer`\>

### signature

> **signature**: `object`

#### signature.hex

> **hex**: `string`

#### signature.recovery

> **recovery**: `number` = `recoverySignature.recovery`
