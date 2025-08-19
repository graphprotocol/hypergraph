# Type Alias: CrossFieldFilter\<T\>

> **CrossFieldFilter**\<`T`\> = `{ [K in keyof T]?: EntityFieldFilter<T[K]> }` & `object`

Defined in: [packages/hypergraph/src/entity/types.ts:67](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/types.ts#L67)

## Type declaration

### not?

> `optional` **not**: `CrossFieldFilter`\<`T`\>

### or?

> `optional` **or**: `CrossFieldFilter`\<`T`\>[]

## Type Parameters

### T

`T`
