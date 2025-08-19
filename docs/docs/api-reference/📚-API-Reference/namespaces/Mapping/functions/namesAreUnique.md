# Function: namesAreUnique()

> **namesAreUnique**\<`T`\>(`entries`): `boolean`

Defined in: [packages/hypergraph/src/mapping/Utils.ts:144](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Utils.ts#L144)

Adds schema validation that the array of objects with property `name` only has unique names

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### entries

readonly `T`[]

## Returns

`boolean`

## Examples

```ts
const types = [{name:'Account'}, {name:'Event'}]
expect(namesAreUnique(types)).toEqual(true)
```

```ts
const types = [{name:'Account'}, {name:'Event'}, {name:'Account'}]
expect(namesAreUnique(types)).toEqual(false)
```
