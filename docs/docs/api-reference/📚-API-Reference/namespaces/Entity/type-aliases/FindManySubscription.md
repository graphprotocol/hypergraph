# Type Alias: FindManySubscription\<S\>

> **FindManySubscription**\<`S`\> = `object`

Defined in: [packages/hypergraph/src/entity/findMany.ts:393](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/findMany.ts#L393)

## Type Parameters

### S

`S` *extends* [`AnyNoContext`](AnyNoContext.md)

## Properties

### getEntities()

> **getEntities**: () => `Readonly`\<[`Entity`](Entity.md)\<`S`\>[]\>

Defined in: [packages/hypergraph/src/entity/findMany.ts:395](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/findMany.ts#L395)

#### Returns

`Readonly`\<[`Entity`](Entity.md)\<`S`\>[]\>

***

### subscribe()

> **subscribe**: (`callback`) => () => `void`

Defined in: [packages/hypergraph/src/entity/findMany.ts:394](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/findMany.ts#L394)

#### Parameters

##### callback

() => `void`

#### Returns

> (): `void`

##### Returns

`void`
