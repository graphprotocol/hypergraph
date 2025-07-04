# Mapping

The public knowledge graph is based on property IDs. In order to integrate with the public knowledge graph you need to map your own schema to IDs from the public graph's schema.

This is done using an object called a mapping. The mapping has to be provided to the `HypergraphAppProvider` component.

A mapping entry defines the type IDs, properties and relations of a type. Here is an example mapping for a schema with an `Event` and a `Company`:

```tsx
export const mapping: Mapping = {
  Event: {
    typeIds: [Id.Id('407d9e8a-c703-4fb4-830d-98c758c8564e')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      sponsors: Id.Id('a7ac80a6-d3d9-4b04-9b9f-ead1723af09f'),
    },
  },
  Company: {
    typeIds: [Id.Id('b0220a78-9205-4e5e-9bf1-c03ee0791e23')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
```

The entire mapping structure can be generated using the TypeSync tool.

```bash
pnpm install -g @graphprotocol/hypergraph-cli@latest
hg typesync --open
```
