# Function: create()

> **create**\<`S`\>(`handle`, `type`): (`data`) => [`Entity`](../type-aliases/Entity.md)\<`S`\>

Defined in: [packages/hypergraph/src/entity/create.ts:11](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/create.ts#L11)

Creates an entity model of given type and stores it in the repo.

## Type Parameters

### S

`S` *extends* [`AnyNoContext`](../type-aliases/AnyNoContext.md)

## Parameters

### handle

`DocHandle`\<[`DocumentContent`](../type-aliases/DocumentContent.md)\>

### type

`S`

## Returns

> (`data`): [`Entity`](../type-aliases/Entity.md)\<`S`\>

### Parameters

#### data

`Readonly`\<`Schema.Schema.Type`\<[`Insert`](../type-aliases/Insert.md)\<`S`\>\>\>

### Returns

[`Entity`](../type-aliases/Entity.md)\<`S`\>
