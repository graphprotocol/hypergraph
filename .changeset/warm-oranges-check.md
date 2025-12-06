---
"@graphprotocol/hypergraph": patch
"@graphprotocol/hypergraph-react": patch
---

Allow relation includes to override nested relation and value space filters by adding _config: { relationSpaces, valueSpaces } to any include branch; GraphQL fragments now honor those overrides when building queries.

```
include: {
  friends: {
    _config: {
      relationSpaces: ['space-a', 'space-b'],
      valueSpaces: 'all',
    },
  },
}
```
  