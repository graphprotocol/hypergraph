# Function: encodeBase58()

> **encodeBase58**(`val`): `string`

Defined in: [packages/hypergraph/src/utils/base58.ts:21](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/utils/base58.ts#L21)

Base58 encodes the given string value.

## Parameters

### val

`string`

string to encode as base58

## Returns

`string`

the base58 encoded string

## Example

```ts
import { v4 as uuidv4 } from "uuid";

const uuid = uuidv4(); // 92539817-7989-4083-ab80-e9c2b2b66669
const dashesRemoved = uuid.replaceAll(/-/g, ""); // 9253981779894083ab80e9c2b2b66669
const encoded = encodeBase58(dashesRemoved)
console.log(encoded) // K51CbDqxW35osbjPo5ZF77
```
