# Hypergraph

Hypergraph is a local-first framework for building web3 consumer applications.

*Status: Developer Preview* Don't use in production!

Build privacy preserving apps with interoperable data using the GRC-20 standard. Read the [Docs](https://docs.hypergraph.thegraph.com/docs/core-concepts), and get started using the Geo Testnet.

* TypeSync - A development environment for creating and managing your app schemas
* Geo Connect - An authentication app for granting your app permissions to user's private spaces
* GRC-20 TS - A knowledge graph SDK for writing and publishing knowledge in the GRC-20 format
* Hypergraph - A local-first framework for building web3 consumer applications
* Hypergraph React - React bindings for Hypergraph

## Development

### Setup

```sh
pnpm install
cd apps/server
cp .env.example .env
# add the PRIVY_APP_SECRET & PRIVY_APP_ID to the apps/server/.env file
pnpm prisma migrate dev
```

### Development

```sh
pnpm build --watch
# in another tab
cd apps/events
pnpm dev
# in another tab
cd apps/server
pnpm dev
```

Any time you make changes to the schema, you will need to run the following commands:

```sh
cd apps/server
pnpm prisma migrate dev # this will also generate the Prisma client
```

To develop the Typesync CLI, you can run:

```sh
cd apps/typesync
pnpm dev
```

To develop the Typesync frontend run:

```sh
# open the vite.config.ts and comment out the server object that specifies the port to be 3000
cd apps/typesync
pnpm run dev:cli
# in another tab
cd apps/typesync
pnpm dev:client
```

You can run the Next example app with:

```sh
# Notes:
# - You need to build the packages first and every time you make changes to the packages
cd apps/next-example
pnpm dev
```

To run the docs locally, you can run:

```sh
cd docs
pnpm start
```