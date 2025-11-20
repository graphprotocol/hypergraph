---
"@graphprotocol/hypergraph-react": patch
"@graphprotocol/hypergraph": patch
---

add fetching of totalCount on relations

For:

```ts
export const Podcast = Entity.Schema(
  {
    name: Type.String,
    hosts: Type.Relation(Person),
  },
  {
    types: [Id('4c81561d-1f95-4131-9cdd-dd20ab831ba2')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      hosts: Id('c72d9abb-bca8-4e86-b7e8-b71e91d2b37e'),
    },
  },
);
```

you can now use:

```ts
useEntities(Podcast, {
  mode: 'public',
  include: {
    hostsTotalCount: true,
  },
});
```