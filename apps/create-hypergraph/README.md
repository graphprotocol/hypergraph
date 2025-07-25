# @graphprotocol/create-hypergraph-app

CLI toolchain to scaffold a [Hypergraph-enabled](https://github.com/graphprotocol/hypergraph) application with a given template.

Inspiration takes from the `vite`, `nextjs`, and `effect` create app command tools.

## Scaffolding a hypergraph app

With NPM:

```bash
npm create hypergraph@latest
```

With Yarn:

```bash
yarn create hypergraph
```

With PNPM:

```bash
pnpm create hypergraph@latest
```

With Bun:

```bash
bun create hypergraph
```

Then follow the given prompts.

### Args

- `app-name` -> if provided, used as the name of the app, as well as the directory the app is scaffolded in to

### Params

- `--template` -> if provided, uses the provided template
  - options:
    - vite-react
    - nextjs
- `--package-manager` -> if provided, uses the provided package manager
  - options:
    - pnpm
    - bun
    - npm
    - yarn
- `--skip-install-deps` -> if flag provided, the deps will not be install in the scaffolded app
  - default: false
- `--skip-initialize-git` -> if flag provided, git will not be initialized in the scaffolded app
  - default: false

```bash
# fully configured
pnpm create hypergraph@latest --template vite-react --package-manager pnpm my-hypergraph-app
```

### Currently Supported Templates

- [vite + react](./template-vite-react/README.md)
- [nextjs](./template-nextjs/README.md)

## References

- [create vite app](https://github.com/vitejs/vite/tree/main/packages/create-vite)
- [create effect app](https://effect.website/docs/getting-started/create-effect-app/)