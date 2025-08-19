# Class: EntityNotFoundError

Defined in: [packages/hypergraph/src/entity/entity.ts:22](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/entity.ts#L22)

## Extends

- `YieldableError`\<`this`\> & `object` & `Readonly`\<\{ `cause?`: `unknown`; `id`: `string`; `type`: [`AnyNoContext`](../type-aliases/AnyNoContext.md); \}\>

## Constructors

### Constructor

> **new EntityNotFoundError**(`args`): `EntityNotFoundError`

Defined in: node\_modules/.pnpm/effect@3.17.6/node\_modules/effect/dist/dts/Data.d.ts:610

#### Parameters

##### args

###### cause?

`unknown`

###### id

`string`

###### type

[`AnyNoContext`](../type-aliases/AnyNoContext.md)

#### Returns

`EntityNotFoundError`

#### Inherited from

`Data.TaggedError('EntityNotFoundError')<{ id: string; type: AnyNoContext; cause?: unknown; }>.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/.pnpm/typescript@5.9.2/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

`Data.TaggedError('EntityNotFoundError').cause`

***

### id

> `readonly` **id**: `string`

Defined in: [packages/hypergraph/src/entity/entity.ts:23](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/entity.ts#L23)

#### Inherited from

`Data.TaggedError('EntityNotFoundError').id`

***

### type

> `readonly` **type**: [`AnyNoContext`](../type-aliases/AnyNoContext.md)

Defined in: [packages/hypergraph/src/entity/entity.ts:24](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/entity.ts#L24)

#### Inherited from

`Data.TaggedError('EntityNotFoundError').type`
