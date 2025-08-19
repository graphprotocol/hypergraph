# Function: subscribeToFindMany()

> **subscribeToFindMany**\<`S`\>(`handle`, `type`, `filter`, `include`): [`FindManySubscription`](../type-aliases/FindManySubscription.md)\<`S`\>

Defined in: [packages/hypergraph/src/entity/findMany.ts:398](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/findMany.ts#L398)

## Type Parameters

### S

`S` *extends* [`AnyNoContext`](../type-aliases/AnyNoContext.md)

## Parameters

### handle

`DocHandle`\<[`DocumentContent`](../type-aliases/DocumentContent.md)\>

### type

`S`

### filter

`undefined` | \{ \[K in string \| number \| symbol\]?: EntityFieldFilter\<Type\<S\>\[K\]\> \}

### include

`undefined` | \{ \[K in string \| number \| symbol\]?: Record\<string, Record\<string, never\>\> \}

## Returns

[`FindManySubscription`](../type-aliases/FindManySubscription.md)\<`S`\>
