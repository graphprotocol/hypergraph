# Hypergraph Framework

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
# in another tab
cd apps/typesync
pnpm run dev:client
```

You can also run Typesync after building:

```sh
# Build all packages and apps first
pnpm build
# Then start Typesync
hypergraph typesync
```

Any time you make changes to the schema, you will need to run the following commands:

```sh
cd apps/server
pnpm prisma migrate dev # this will also generate the Prisma client
```

You can run the next example app with:

```sh
# Notes:
# - You need to build the packages first and every time you make changes to the packages
cd apps/next-example
pnpm dev
```

## Upgrading Dependencies

```sh
pnpm up --interactive --latest -r
```

## Publishing

```sh
# publish hypergraph
pnpm build
cd packages/hypergraph/publish
pnpm publish
# publish hypergraph-react
pnpm build
cd packages/hypergraph-react/publish
pnpm publish
```