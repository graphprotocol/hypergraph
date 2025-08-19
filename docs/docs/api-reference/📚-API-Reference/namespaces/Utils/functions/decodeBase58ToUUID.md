# Function: decodeBase58ToUUID()

> **decodeBase58ToUUID**(`encoded`): `string`

Defined in: [packages/hypergraph/src/utils/base58.ts:56](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/utils/base58.ts#L56)

Expand the base58 encoded UUID back to its original UUID format

## Parameters

### encoded

`string`

base58 encoded UUID

## Returns

`string`

the expanded UUID from the base58 encoded value

## Example

```ts
const uuid = 92539817-7989-4083-ab80-e9c2b2b66669;
const encoded = encodeBase58(dashesRemoved); // K51CbDqxW35osbjPo5ZF77
const decoded = decodeBase58ToUUID(encoded); // 92539817-7989-4083-ab80-e9c2b2b66669

expect(decoded).toEqual(uuid);
```
