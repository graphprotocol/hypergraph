# Function: Relation()

> **Relation**\<`S`\>(`schema`): `Field`\<\{ `insert`: `optional`\<`Array$`\<*typeof* `String$`\>\>; `select`: `Schema`\<readonly [`EntityWithRelation`](../../Entity/type-aliases/EntityWithRelation.md)\<`S`\>[], readonly [`EntityWithRelation`](../../Entity/type-aliases/EntityWithRelation.md)\<`S`\>[], `never`\>; `update`: *typeof* `Undefined`; \}\>

Defined in: [packages/hypergraph/src/type/type.ts:23](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/type/type.ts#L23)

## Type Parameters

### S

`S` *extends* [`AnyNoContext`](../../Entity/type-aliases/AnyNoContext.md)

## Parameters

### schema

`S`

## Returns

`Field`\<\{ `insert`: `optional`\<`Array$`\<*typeof* `String$`\>\>; `select`: `Schema`\<readonly [`EntityWithRelation`](../../Entity/type-aliases/EntityWithRelation.md)\<`S`\>[], readonly [`EntityWithRelation`](../../Entity/type-aliases/EntityWithRelation.md)\<`S`\>[], `never`\>; `update`: *typeof* `Undefined`; \}\>
