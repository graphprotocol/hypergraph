---
"create-hypergraph": minor
---

Add typesync script to templates. Bump both template @graphprotocol/hypergraph and @graphprotocol/hypergraph-react packages to 0.6.0 with typesync

Running typesync:

1. scaffold a hypergraph app: `pnpm create hypergraph@latest --template vite-react --package-manager pnpm my-hypergraph-app`
2. approve builds: `pnpm approve-builds`
3. run typesync: `pnpm run typesync`