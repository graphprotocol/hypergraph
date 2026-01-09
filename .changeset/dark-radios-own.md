---
"@graphprotocol/hypergraph-react": minor
"@graphprotocol/hypergraph": minor
"connect": minor
---

For IDs switch from UUIDs with dashes to UUIDs without dashes e.g. "a126ca53-0c8e-48d5-b888-82c734c38935" to "a126ca530c8e48d5b88882c734c38935"

- For all public API endpoints switch from `/graphql` to `/v2/graphql`
- Expose new Utils: `Utils.GeoIdSchema`, `Utils.normalizeGeoId`, `Utils.isGeoId`, `Utils.parseGeoId`, `Utils.toUuid`
  