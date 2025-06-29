## Running Connect and Sync Server Locally

To run the Connect and Sync Server locally, you need to get the Hypergraph repository:

```bash
git clone https://github.com/graphprotocol/hypergraph.git
cd hypergraph
pnpm install
```

```bash
cd apps/connect
pnpm dev
# in another tab
cd apps/server
pnpm dev
```

The Connect app is available at `http://localhost:5173` and the Sync Server is available at `http://localhost:3000`.