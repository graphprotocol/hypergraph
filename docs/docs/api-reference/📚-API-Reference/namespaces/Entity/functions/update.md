# Function: update()

> **update**\<`S`\>(`handle`, `type`): (`id`, `data`) => [`Entity`](../type-aliases/Entity.md)\<`S`\>

Defined in: [packages/hypergraph/src/entity/update.ts:9](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/update.ts#L9)

Update an existing entity model of given type in the repo.

## Type Parameters

### S

`S` *extends* [`AnyNoContext`](../type-aliases/AnyNoContext.md)

## Parameters

### handle

`DocHandle`\<[`DocumentContent`](../type-aliases/DocumentContent.md)\>

### type

`S`

## Returns

> (`id`, `data`): [`Entity`](../type-aliases/Entity.md)\<`S`\>

### Parameters

#### id

`string`

#### data

\{ \[K in string \| number \| symbol\]: Partial\<Type\<Update\<S\>\>\>\[K\] \}

### Returns

[`Entity`](../type-aliases/Entity.md)\<`S`\>
