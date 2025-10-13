---
"create-hypergraph": minor
"@graphprotocol/hypergraph-react": minor
"@graphprotocol/hypergraph": minor
---

Schema Definition API Change (Breaking Change)
  
Before:
```ts
export class User extends Entity.Class<User>('User')({
  name: Type.String,
}) {}
```

After:
```ts
export const User = Entity.Schema(
  { name: Type.String },
  {
    types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
);
```

All entity definitions need to be rewritten. The new API requires explicit type IDs and property IDs.