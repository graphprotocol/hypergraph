---
"@graphprotocol/hypergraph": patch
"@graphprotocol/hypergraph-react": patch
---

Add `type` field to `PublicSpace` type returned by `Space.findManyPublic()` and `usePublicSpaces()`. The type is either `"PERSONAL"` or `"DAO"`.
