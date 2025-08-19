# Function: generateMapping()

> **generateMapping**(`input`): [`GenerateMappingResult`](../type-aliases/GenerateMappingResult.md)

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:633](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L633)

Takes the user-submitted schema, validates it, and build the `Mapping` definition for the schema as well as the GRC-20 Ops needed to publish the schema/schema changes to the Knowledge Graph.

## Parameters

### input

user-built and submitted schema

#### types

readonly `object`[] = `...`

## Returns

[`GenerateMappingResult`](../type-aliases/GenerateMappingResult.md)

the generated [Mapping] definition from the submitted schema as well as the GRC-20 Ops required to publish the schema to the Knowledge Graph

## Example

```ts
import { Id } from "@graphprotocol/grc-20"
import { generateMapping } from "@graphprotocol/hypergraph"

const schema: Schema = {
  types: [
    {
      name: "Account",
      knowledgeGraphId: "a5fd07b1-120f-46c6-b46f-387ef98396a6",
      properties: [
        {
          name: "username",
          dataType: "String",
          knowledgeGraphId: "994edcff-6996-4a77-9797-a13e5e3efad8"
        },
        {
          name: "createdAt",
          dataType: "Date",
          knowledgeGraphId: null
        }
      ]
    },
    {
      name: "Event",
      knowledgeGraphId: null,
      properties: [
        {
          name: "name",
          dataType: "String",
          knowledgeGraphId: "3808e060-fb4a-4d08-8069-35b8c8a1902b"
        },
        {
          name: "description",
          dataType: "String",
          knowledgeGraphId: null
        },
        {
          name: "speaker",
          dataType: "Relation(Account)",
          relationType: "Account",
          knowledgeGraphId: null
        }
      ]
    }
  ],
}
const [mapping, ops] = generateMapping(schema)

expect(mapping).toEqual({
  Account: {
    typeIds: [Id("a5fd07b1-120f-46c6-b46f-387ef98396a6")], // comes from input schema
    properties: {
      username: Id("994edcff-6996-4a77-9797-a13e5e3efad8"), // comes from input schema
      createdAt: Id("8cd7d9ac-a878-4287-8000-e71e6f853117"), // generated from Graph.createProperty Op
    }
  },
  Event: {
    typeIds: [Id("20b3fe39-8e62-41a0-b9cb-92743fd760da")], // generated from Graph.createType Op
    properties: {
      name: Id("3808e060-fb4a-4d08-8069-35b8c8a1902b"), // comes from input schema
      description: Id("8fc4e17c-7581-4d6c-a712-943385afc7b5"), // generated from Graph.createProperty Op
    },
    relations: {
      speaker: Id("651ce59f-643b-4931-bf7a-5dc0ca0f5a47"), // generated from Graph.createProperty Op
    }
  }
})
expect(ops).toEqual([
  // Graph.createProperty Op for Account.createdAt property
  {
    type: "CREATE_PROPERTY",
    property: {
      id: Id("8cd7d9ac-a878-4287-8000-e71e6f853117"),
      dataType: "String"
    }
  },
  // Graph.createProperty Op for Event.description property
  {
    type: "CREATE_PROPERTY",
    property: {
      id: Id("8fc4e17c-7581-4d6c-a712-943385afc7b5"),
      dataType: "String"
    }
  },
  // Graph.createProperty Op for Event.speaker property
  {
    type: "CREATE_PROPERTY",
    property: {
      id: Id("651ce59f-643b-4931-bf7a-5dc0ca0f5a47"),
      dataType: "RELATION"
    }
  },
  // Graph.createType Op for Event type
  {
    type: "CREATE_PROPERTY",
    property: {
      id: Id("651ce59f-643b-4931-bf7a-5dc0ca0f5a47"),
      dataType: "RELATION"
    }
  },
])
```

## Since

0.2.0
