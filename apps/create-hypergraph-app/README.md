# @graphprotocol/create-hypergraph-app

CLI toolchain to scaffold a [Hypergraph-enabled](https://github.com/graphprotocol/hypergraph) application with a given template.

Inspiration takes from the `vite`, `nextjs`, and `effect` create app command tools.

## Scaffolding a hypergraph app

With NPM:

```bash
npm create hypergraph-app@latest
```

With Yarn:

```bash
yarn create hypergraph-app
```

With PNPM:

```bash
pnpm create hypergraph-app@latest
```

With Bun:

```bash
bun create hypergraph-app
```

Then follow the given prompts.

### Currently Supported Templates

- vite + react

## Example: scaffolding a vite + react app, initializing the git repo and installing deps with pnpm

```bash
✔ What is your app named? … my-hypergraph-app
✔ Choose your template …  Vite + React
✔ What package manager do you want to use? …  pnpm
✔ Do you want us to install deps? … Yes / No
✔ Initialize a git repository? … Yes / No
Scaffolding vite-react hypergraph app in /my-hypergraph-app...
Initialized empty Git repository
```

## References

- [create vite app](https://github.com/vitejs/vite/tree/main/packages/create-vite)
- [create effect app](https://effect.website/docs/getting-started/create-effect-app/)