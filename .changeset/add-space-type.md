---
"@graphprotocol/hypergraph": patch
"@graphprotocol/hypergraph-react": patch
---

Add `type` field to `PublicSpace` type returned by `Space.findManyPublic()` and `usePublicSpaces()`. The type is either `"PERSONAL"` or `"DAO"`.

Add `spaceType` filter option to `Space.findManyPublic()` and `usePublicSpaces()` to filter spaces by type. Example usage:

```typescript
// Filter for DAO spaces only
const { data } = usePublicSpaces({ filter: { spaceType: 'DAO' } });

// Combine with existing filters
const { data } = usePublicSpaces({ filter: { editorId: 'xxx', spaceType: 'PERSONAL' } });
```
