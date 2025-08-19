# Function: findOne()

> **findOne**\<`S`\>(`handle`, `type`, `include`): (`id`) => `undefined` \| [`Entity`](../type-aliases/Entity.md)\<`S`\>

Defined in: [packages/hypergraph/src/entity/findOne.ts:10](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/findOne.ts#L10)

Find the entity of the given type, with the given id, from the repo.

## Type Parameters

### S

`S` *extends* [`AnyNoContext`](../type-aliases/AnyNoContext.md)

## Parameters

### handle

`DocHandle`\<[`DocumentContent`](../type-aliases/DocumentContent.md)\>

### type

`S`

### include

\{ \[K in string \| number \| symbol\]?: Record\<string, never\> \} = `{}`

## Returns

> (`id`): `undefined` \| [`Entity`](../type-aliases/Entity.md)\<`S`\>

### Parameters

#### id

`string`

### Returns

`undefined` \| [`Entity`](../type-aliases/Entity.md)\<`S`\>
