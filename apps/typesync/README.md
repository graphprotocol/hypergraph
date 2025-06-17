# @graphprotocol/typesync

CLI toolchain to view existing types, select, pick, extend to create schemas and generate a [@graphprotocol/hypergraph](https://github.com/graphprotocol/hypergraph/tree/main/packages/hypergraph) schema.

## Installing

```bash
# npm
npm i -g @graphprotocol/typesync-cli

# yarn
yarn global add @graphprotocol/typesync-cli

# pnpm
pnpm install -g @graphprotocol/typesync-cli
```

## Running

```bash
typsync --help

# opening typesync studio
typesync studio

# opening typesync studio in firefox automatically
typesync studio --open --browser firefox
```

## Commands

- `studio` -> runs the `Typesync` api and client UI application for viewing created application schemas, browsing the Knowledge Graph, and creating new application schemas.
  - running: `typesync studio`
  - args:
    - `port` [OPTIONAL, default = 3000] port to run the application on
      - example: `typesync studio --port 3001`
    - `browser` [OPTION, default 'browser'] browser to open the app in, if the `--open` flag is passed
      - example: `typesync studio --open --browser firefox`