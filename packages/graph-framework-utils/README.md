# @graph-framework/utils

Provides common utilities for the Graph Framework.

_All utilities must be runnable on: Browser, NodeJS server, ReactNative._

## API

- `generateId()` - generates a base58 encoded ID from a generated v4 UUID.

```ts
import { generateId } from "@graph-framework/utils";

const id = generateId();
console.log(id); // Gw9uTVTnJdhtczyuzBkL3X
```

### Base58 utils

- `encodeBase58` - encodes a given string (like the hyphen-stripped UUID) to base 58

```ts
import { v4 } from "uuid";
import { encodeBase58 } from "@graph-framework/utils";

const uuid = v4(); // 92539817-7989-4083-ab80-e9c2b2b66669
const stripped = uuid.replaceAll(/-/g, ""); // 9253981779894083ab80e9c2b2b66669
const encoded = encodeBase58(dashesRemoved);
console.log(encoded); // K51CbDqxW35osbjPo5ZF77
```

- `decodeBase58ToUUID` - decodes the given base58 encoded UUID back to its original UUID value

```ts
import { v4 } from "uuid";
import { decodeBase58ToUUID, encodeBase58 } from "@graph-framework/utils";

const uuid = v4(); // 92539817-7989-4083-ab80-e9c2b2b66669
const stripped = uuid.replaceAll(/-/g, ""); // 9253981779894083ab80e9c2b2b66669
const encoded = encodeBase58(dashesRemoved); // K51CbDqxW35osbjPo5ZF77
const decoded = decodeBase58ToUUID(encoded);

expect(encoded).toHaveLength(22);
expect(decoded).toEqual(uuid);
```

### JSC utils

- `canonicalize` - JSON canonicalize function. Creates crypto safe predictable canocalization of JSON as defined by RFC8785.

```ts
import { canonicalize } from '@graph-framework/utils'

console.log(canonicalize(null)) // 'null'
console.log(canonicalize(1)) // '1'
console.log(canonicalize("test")) // "string"
console.log(canonicalize(true)) // 'true'
const json = {
  from_account: '543 232 625-3',
  to_account: '321 567 636-4',
  amount: 500,
  currency: 'USD',
};
console.log(canonicalize(json)) // '{"amount":500,"currency":"USD","from_account":"543 232 625-3","to_account":"321 567 636-4"}'
console.log(canonicalize([1, 'text', null, true, false])) // '[1,"text",null,true,false]'
```