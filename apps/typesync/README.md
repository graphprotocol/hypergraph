# @graphprotocol/hypergraph-cli

# Hypergraph command-line toolchain for scaffolding and working with Hypergraph applications.

## Installing

```bash
# npm
npm i -g @graphprotocol/hypergraph-cli

# yarn
yarn global add @graphprotocol/hypergraph-cli

# pnpm
pnpm install -g @graphprotocol/hypergraph-cli
```

## Running

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
pnpm build
# then, from anywhere in the repo, start Typesync
hypergraph typesync
```

## Commands

- `typesync` -> runs the Hypergraph API and client UI application for viewing created application schemas, browsing the Knowledge Graph, and creating new application schemas.
  - running: `hypergraph typesync`
  - args:
    - `port` [OPTIONAL, default = 3000] port to run the application on
      - example: `hypergraph typesync --port 3001`
    - `browser` [OPTION, default 'browser'] browser to open the app in, if the `--open` flag is passed
      - example: `hypergraph typesync --open --browser firefox`

## Generating & running a new app

1.  Start TypeSync:
    ```bash
    hypergraph typesync
    ```
2.  In the UI click **Generate App** and choose a name (e.g. `awesome-app`).  When the toast shows the path, the scaffold is ready and all dependencies are already installed.
3.  Run it:
    ```bash
    cd awesome-app
    pnpm dev
    ```

No additional `pnpm install` is necessary – the generator takes care of adding the app to the workspace and installing its dependencies for you.