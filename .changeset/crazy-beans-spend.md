---
"@graphprotocol/hypergraph-react": patch
"@graphprotocol/hypergraph": patch
---

Extend Entity.Schema to allow querying for relation entity values

In the following example we define a Project entity and a Podcast entity with the relation `projects` to the Project entity. In the Type.Relation you now can define the properties of the relation entity as a second argument. In the mapping you also need to define the properties of the relation entity instead of just the property id of the relation.

```ts
export const Project = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('69732974-c632-490d-81a3-12ea567b2a8e')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
);

export const Podcast = Entity.Schema(
  {
    name: Type.String,
    projects: Type.Relation(Project, {
      properties: {
        website: Type.optional(Type.String),
      },
    }),
  },
  {
    types: [Id('69732974-c632-490d-81a3-12ea567b2a8e')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      projects: {
        propertyId: Id('71931b5f-1d6a-462e-81d9-5b8e85fb5c4b'),
        properties: {
          website: Id('eed38e74-e679-46bf-8a42-ea3e4f8fb5fb'),
        },
      },
    },
  },
);
```