# Type Alias: Mapping

> **Mapping** = `object`

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:70](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L70)

## Index Signature

\[`key`: `string`\]: [`MappingEntry`](MappingEntry.md)

## Example

```ts
import { Id } from '@graphprotocol/hypergraph'
import type { Mapping } from '@graphprotocol/hypergraph/mapping'

const mapping: Mapping = {
  Account: {
    typeIds: [Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
    properties: {
      username: Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
      createdAt: Id('64bfba51-a69b-4746-be4b-213214a879fe')
    }
  },
  Event: {
    typeIds: [Id('0349187b-526f-435f-b2bb-9e9caf23127a')],
    properties: {
      name: Id('3808e060-fb4a-4d08-8069-35b8c8a1902b'),
      description: Id('1f0d9007-8da2-4b28-ab9f-3bc0709f4837'),
    },
    relations: {
      speaker: Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')
    }
  }
}
```

## Since

0.2.0
