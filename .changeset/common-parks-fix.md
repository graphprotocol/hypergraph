---
"@graphprotocol/hypergraph": minor
"@graphprotocol/hypergraph-react": minor
---

Add configurable API origin support

- Add `Config.setApiOrigin()` and `Config.getApiOrigin()` functions to allow setting a custom API origin globally
- Add `apiOrigin` prop to `HypergraphAppProvider` for React apps
- Replace all hardcoded `Graph.TESTNET_API_ORIGIN` references with configurable `Config.getApiOrigin()`
- Default behavior remains unchanged (uses testnet) if not configured
