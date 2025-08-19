# Function: allRelationPropertyTypesExist()

> **allRelationPropertyTypesExist**(`types`): `boolean`

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:324](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L324)

Iterate through all properties in all types in the schema of `dataType` === `Relation(${string})`
and validate that the schema.types have a type for the existing relation

## Parameters

### types

readonly `object`[]

the user-submitted schema types

## Returns

`boolean`

## Examples

```ts
import { allRelationPropertyTypesExist, type Mapping } from '@graphprotocol/hypergraph/mapping'

const types: Mapping['types'] = [
  {
    name: "Account",
    knowledgeGraphId: null,
    properties: [
      {
        name: "username",
        dataType: "String",
        knowledgeGraphId: null
      }
    ]
  },
  {
    name: "Event",
    knowledgeGraphId: null,
    properties: [
      {
        name: "speaker",
        dataType: "Relation(Account)"
        relationType: "Account",
        knowledgeGraphId: null,
      }
    ]
  }
]
expect(allRelationPropertyTypesExist(types)).toEqual(true)
```

```ts
import { allRelationPropertyTypesExist, type Mapping } from '@graphprotocol/hypergraph/mapping'

const types: Mapping['types'] = [
  {
    name: "Event",
    knowledgeGraphId: null,
    properties: [
      {
        name: "speaker",
        dataType: "Relation(Account)",
        relationType: "Account",
        knowledgeGraphId: null,
      }
    ]
  }
]
expect(allRelationPropertyTypesExist(types)).toEqual(false)
```

## Since

0.2.0
