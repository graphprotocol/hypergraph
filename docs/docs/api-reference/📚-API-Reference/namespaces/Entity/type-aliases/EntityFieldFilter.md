# Type Alias: EntityFieldFilter\<T\>

> **EntityFieldFilter**\<`T`\> = `object` & `T` *extends* `boolean` ? `object` : `T` *extends* `number` ? `object` : `T` *extends* `string` ? `object` : `Record`\<`string`, `never`\>

Defined in: [packages/hypergraph/src/entity/types.ts:74](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/types.ts#L74)

## Type declaration

### is?

> `optional` **is**: `T`

## Type Parameters

### T

`T`
