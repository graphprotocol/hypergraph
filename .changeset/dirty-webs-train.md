---
"@graphprotocol/hypergraph": patch
"@graphprotocol/hypergraph-react": patch
---

Add filtering entities by id e.g. 

```ts
const { data } = useEntities(Person, {
  filter: {
    or: [
      { id: { is: 'fe9f0c57-3682-4a77-8ef4-205da3cd0a33' } },
      { id: { is: '1e5dcefd-bae0-4133-b743-6d2d7bebc5b9' } },
    ],
  },
});
```
