# Function: findMany()

> **findMany**\<`S`\>(`handle`, `type`, `filter`, `include`): `object`

Defined in: [packages/hypergraph/src/entity/findMany.ts:238](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/findMany.ts#L238)

Queries for a list of entities of the given type from the repo.

## Type Parameters

### S

`S` *extends* [`AnyNoContext`](../type-aliases/AnyNoContext.md)

## Parameters

### handle

`DocHandle`\<[`DocumentContent`](../type-aliases/DocumentContent.md)\>

### type

`S`

### filter

`undefined` | [`EntityFilter`](../type-aliases/EntityFilter.md)\<`Type`\<`S`\>\>

### include

`undefined` | \{ \[K in string \| number \| symbol\]?: Record\<string, Record\<string, never\>\> \}

## Returns

`object`

### corruptEntityIds

> **corruptEntityIds**: readonly `string`[]

### entities

> **entities**: readonly [`Entity`](../type-aliases/Entity.md)\<`S`\>[]
