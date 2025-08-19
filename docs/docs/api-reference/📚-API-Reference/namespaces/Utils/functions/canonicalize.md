# Function: canonicalize()

> **canonicalize**\<`T`\>(`object`): `string`

Defined in: [packages/hypergraph/src/utils/jsc.ts:53](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/utils/jsc.ts#L53)

JSON canonicalize function.
Creates crypto safe predictable canocalization of JSON as defined by RFC8785.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### object

`T`

object to JSC canonicalize

## Returns

`string`

## See

 - https://tools.ietf.org/html/rfc8785
 - https://www.rfc-editor.org/rfc/rfc8785

## Examples

```ts
import { canonicalize } from '@graph-framework/utils'

console.log(canonicalize(null)) // 'null'
console.log(canonicalize(1)) // '1'
console.log(canonicalize("test")) // "string"
console.log(canonicalize(true)) // 'true'
```

```
import { canonicalize } from '@graph-framework/utils'

const json = {
   from_account: '543 232 625-3',
   to_account: '321 567 636-4',
   amount: 500,
   currency: 'USD',
};
console.log(canonicalize(json)) // '{"amount":500,"currency":"USD","from_account":"543 232 625-3","to_account":"321 567 636-4"}'
```

```ts
import { canonicalize } from '@graph-framework/utils'

console.log(canonicalize([1, 'text', null, true, false])) // '[1,"text",null,true,false]'
```

## Throws

NaNNotAllowedError if given object is of type number, but is not a valid number

## Throws

InfinityNotAllowedError if given object is of type number, but is the infinite number
