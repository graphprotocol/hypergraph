# @graphprotocol/typesync

CLI toolchain to view existing types, select, pick, extend to create schemas and generate a @graphprotocol/hypergraph schema.

The `@graphprotocol/typesync` cli works by spinning up a [hono](https://hono.dev/) nodejs server that exposes a built vitejs react app. This app will let users see their created app schemas as well as search existing types to create new app schemas.
Once the user has a schema built in the app, they can then run codegen, which will send a message to the server to codegen the built schema using the `@graphprotocol/hypergraph` framework.

## Running Code

This template leverages [tsx](https://tsx.is) to allow execution of TypeScript files via NodeJS as if they were written in plain JavaScript.

To execute a file with `tsx`:

```sh
pnpm run dev
```

## Operations

**Building**

To build the package:

```sh
pnpm build
```

**Testing**

To test the package:

```sh
pnpm test
```

