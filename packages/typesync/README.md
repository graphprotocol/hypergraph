# @graphprotocol/typesync

Package for generating the mappings used within the `hypergraph` ecosystem that is used to query for entities on the Knowledge Graph by the `grc-20` id's.

The `Mapping` is passed to the `<HypergraphSpaceProvider>` from the [@graphprotocol/hypergraph-react](../hypergraph-react/README.md) context to inform the query layer what entities to query from the Knowledge Graph.

This package exposes a function: `generateMapping` that takes the schema with an array of types, each with properties. Both `types` and `properties` have a nullable `knowledgeGraphId` UUID value. If a value is provided, the `type/property` exists on the Knowledge Graph; this value will be plugged into to the `Mapping` values. If the `knowledgeGraphId` value is null, the `type/property` will be created using the `@graphprotocol/grc-20` ops and then returned in the mapping.

## Mapping definition

```ts
import { Id } from '@graphprotocol/grc-20';

export type MappingEntry = {
  typeIds: Array<Id.Id>;
  properties?: {
    [key: string]: Id.Id;
  };
  relations?: {
    [key: string]: Id.Id
  }
};

export type Mapping = {
  [key: string]: MappingEntry;
};
```

## Example

- generated schema

```ts
import { Entity, Type } from '@graphprotocol/hypergraph'

export class Account extends Entity.Class<Account>('Account')({
  username: Type.Text,
  createdAt: Type.Date
}) {}

export class Event extends Entity.Class<Event>('Event')({
  name: Type.Text,
  description: Type.Text,
  speaker: Type.Relation(Account)
}) {}
```

- resuling mapping

```ts
import { Id } from '@graphprotocol/grc-20'
import type { Mapping } from '@graphprotocol/typesync/Mapping'

export const mapping: Mapping = {
  Account: {
    typeIds: [Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
    properties: {
      username: Id.Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
      createdAt: Id.Id('64bfba51-a69b-4746-be4b-213214a879fe')
    }
  },
  Event: {
    typeIds: [Id.Id('0349187b-526f-435f-b2bb-9e9caf23127a')],
    properties: {
      name: Id.Id('3808e060-fb4a-4d08-8069-35b8c8a1902b'),
      description: Id.Id('1f0d9007-8da2-4b28-ab9f-3bc0709f4837'),
    },
    relations: {
      speaker: Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')
    }
  }
}
```

## References

- [@graphprotocol/grc-20](https://github.com/graphprotocol/grc-20-ts)