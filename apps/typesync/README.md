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

# opening Hypergraph studio
hypergraph studio
hg studio

# opening Hypergraph studio in firefox automatically
hypergraph studio --open --browser firefox
```

## Commands

- `studio` -> runs the Hypergraph API and client UI application for viewing created application schemas, browsing the Knowledge Graph, and creating new application schemas.
  - running: `hypergraph studio`
  - args:
    - `port` [OPTIONAL, default = 3000] port to run the application on
      - example: `hypergraph studio --port 3001`
    - `browser` [OPTION, default 'browser'] browser to open the app in, if the `--open` flag is passed
      - example: `hypergraph studio --open --browser firefox`