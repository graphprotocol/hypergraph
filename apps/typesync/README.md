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

```bash
hypergraph --help
hg --help   # short alias

# opening TypeSync
hypergraph typesync
hg typesync

# opening TypeSync in firefox automatically
hypergraph typesync --open --browser firefox
```

## Commands

- `typesync` -> runs the Hypergraph API and client UI application for viewing created application schemas, browsing the Knowledge Graph, and creating new application schemas.
  - running: `hypergraph typesync`
  - args:
    - `port` [OPTIONAL, default = 3000] port to run the application on
      - example: `hypergraph typesync --port 3001`
    - `browser` [OPTION, default 'browser'] browser to open the app in, if the `--open` flag is passed
      - example: `hypergraph typesync --open --browser firefox`