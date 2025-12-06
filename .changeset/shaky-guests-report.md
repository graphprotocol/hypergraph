---
"@graphprotocol/hypergraph-react": patch
"@graphprotocol/hypergraph": patch
---

Add a logInvalidResults toggle to `Entity.findOnePublic/findManyPublic`, plus pass-through support in the React provider and hooks, so apps can selectively silence or surface schema-validation warnings while still receiving the invalid payload lists.
  