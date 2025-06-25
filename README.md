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

### Scaffolding a new Hypergraph application

```sh
# 1. Launch TypeSync (if it isn't already running)
hypergraph typesync

# 2. In the browser UI click **Generate App**, choose an app name (e.g. `my-app`).
#    When the toast says "Application my-app generated at ./my-app" the scaffold
#    is complete and all dependencies are already installed.

# 3. Run the app
cd my-app
pnpm dev
```

That's it – the generator automatically

* adds the app to `pnpm-workspace.yaml`,
* runs `pnpm install` inside the new folder, *and*
* re-installs at the workspace root so everything stays in sync.

You can immediately start hacking in [`src/routes`](my-app/src/routes) and the
Vite dev server will hot-reload your changes.

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